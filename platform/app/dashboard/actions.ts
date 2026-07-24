"use server";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CHART_BUCKET } from "@/lib/storage";
import { generateMockAnalysis } from "@/lib/mock";
import { analyzeChart } from "@/lib/ai/analyzeChart";
import { AiNotConfiguredError } from "@/lib/ai/errors";

// Once ANTHROPIC_API_KEY is live, every upload is a real (paid) API call --
// this is a basic abuse/cost guard, not a precise rate limiter. Fails open:
// if the count query itself errors, uploads are allowed rather than blocked,
// same "never let a side-check break the core flow" philosophy as the
// AI-analysis fallback below.
const RATE_LIMIT_MAX_UPLOADS = 10;
const RATE_LIMIT_WINDOW_MINUTES = 60;

export type UploadChartResult =
  | { ok: true; chartId: string }
  | { ok: false; error: string };

/**
 * Uploads a chart image and analyzes it, all server-side:
 *   1. Re-verify auth (defense in depth, on top of proxy.ts).
 *   2. Check the upload rate limit.
 *   3. Upload the file to Storage.
 *   4. Insert the `charts` row.
 *   5. Try real AI analysis (lib/ai/analyzeChart.ts); if it's not
 *      configured (no ANTHROPIC_API_KEY yet) or fails for any reason,
 *      fall back to the mock generator -- analysis problems must never
 *      block the upload itself.
 *   6. Insert the `chart_analyses` row and mark the chart complete.
 *
 * The whole file goes through this one Server Action (not a separate
 * client-side Storage upload) so the same in-memory bytes can be handed
 * straight to the vision model without a redundant download-from-Storage
 * round trip.
 *
 * Returns a result object rather than throwing for expected failures (bad
 * file, rate limit, Storage/DB errors) -- confirmed via testing that Next.js
 * redacts thrown Server Action errors to a generic message in production
 * builds, the same way it redacts render errors caught by error.tsx. A
 * thrown Error here would never actually reach the user; returning data
 * does, same pattern the login/signup actions already use correctly.
 */
export async function uploadChart(
  formData: FormData
): Promise<UploadChartResult> {
  const user = await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Please upload an image file (chart screenshot)." };
  }

  const supabase = await createClient();

  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  ).toISOString();
  const { count, error: countError } = await supabase
    .from("charts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", windowStart);

  if (!countError && (count ?? 0) >= RATE_LIMIT_MAX_UPLOADS) {
    return {
      ok: false,
      error: `You've uploaded ${RATE_LIMIT_MAX_UPLOADS} charts in the last hour. Please wait a bit before uploading more.`,
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "png";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(CHART_BUCKET)
    .upload(path, bytes, { contentType: file.type });
  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data: chart, error: chartError } = await supabase
    .from("charts")
    .insert({ user_id: user.id, image_path: path, status: "pending" })
    .select("id")
    .single();

  if (chartError) {
    await supabase.storage.from(CHART_BUCKET).remove([path]);
    return { ok: false, error: chartError.message };
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

  return { ok: true, chartId };
}
