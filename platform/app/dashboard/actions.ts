"use server";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { generateMockAnalysis } from "@/lib/mock";

/**
 * Records an already-uploaded chart image (the browser uploads directly to
 * Storage; this just writes the DB row), then immediately generates and
 * stores a MOCK analysis result for it -- there is no real chart-reading AI
 * yet (Phase 3 Step 5). Re-verifies auth independently of proxy.ts, and
 * re-verifies the path actually belongs to this user before inserting --
 * defense in depth, on top of the RLS policies that are the real boundary
 * (see supabase/migrations/0001_init.sql, 0002_mock_analysis.sql).
 */
export async function createChartRecord(imagePath: string) {
  const user = await requireUser();

  if (!imagePath.startsWith(`${user.id}/`)) {
    throw new Error("Chart path does not belong to the current user.");
  }

  const supabase = await createClient();
  const { data: chart, error: chartError } = await supabase
    .from("charts")
    .insert({ user_id: user.id, image_path: imagePath, status: "pending" })
    .select("id")
    .single();

  if (chartError) {
    throw new Error(chartError.message);
  }

  const chartId = chart.id as string;

  const { error: mockError } = await supabase.from("mock_analyses").insert({
    chart_id: chartId,
    user_id: user.id,
    ...generateMockAnalysis(),
  });

  if (mockError) {
    // Chart record exists, but no mock result -- the detail page shows a
    // "still pending" state rather than failing the whole upload.
    return chartId;
  }

  await supabase
    .from("charts")
    .update({ status: "mock_complete" })
    .eq("id", chartId);

  return chartId;
}
