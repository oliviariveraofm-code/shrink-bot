"use server";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CHART_BUCKET } from "@/lib/storage";
import { generateMockAnalysis } from "@/lib/mock";
import { analyzeChart } from "@/lib/ai/analyzeChart";
import { AiNotConfiguredError } from "@/lib/ai/errors";

/**
 * Uploads a chart image and analyzes it, all server-side:
 *   1. Re-verify auth (defense in depth, on top of proxy.ts).
 *   2. Upload the file to Storage.
 *   3. Insert the `charts` row.
 *   4. Try real AI analysis (lib/ai/analyzeChart.ts); if it's not
 *      configured (no ANTHROPIC_API_KEY yet) or fails for any reason,
 *      fall back to the mock generator -- analysis problems must never
 *      block the upload itself.
 *   5. Insert the `chart_analyses` row and mark the chart complete.
 *
 * The whole file goes through this one Server Action (not a separate
 * client-side Storage upload) so the same in-memory bytes can be handed
 * straight to the vision model without a redundant download-from-Storage
 * round trip.
 */
export async function uploadChart(formData: FormData) {
  const user = await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("No file provided.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file (chart screenshot).");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "png";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const supabase = await createClient();

  const { error: uploadError } = await supabase.storage
    .from(CHART_BUCKET)
    .upload(path, bytes, { contentType: file.type });
  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: chart, error: chartError } = await supabase
    .from("charts")
    .insert({ user_id: user.id, image_path: path, status: "pending" })
    .select("id")
    .single();

  if (chartError) {
    await supabase.storage.from(CHART_BUCKET).remove([path]);
    throw new Error(chartError.message);
  }

  const chartId = chart.id as string;

  let analysis: Awaited<ReturnType<typeof generateMockAnalysis>>;
  try {
    const result = await analyzeChart(bytes, file.type);
    analysis = { source: "claude-vision" as const, ...result };
  } catch (err) {
    if (!(err instanceof AiNotConfiguredError)) {
      console.error("Chart analysis failed, falling back to mock:", err);
    }
    analysis = generateMockAnalysis();
  }

  const { error: analysisError } = await supabase.from("chart_analyses").insert({
    chart_id: chartId,
    user_id: user.id,
    ...analysis,
  });

  if (!analysisError) {
    await supabase.from("charts").update({ status: "complete" }).eq("id", chartId);
  }

  return chartId;
}
