import AppNav from "@/components/AppNav";
import ChartGrid from "@/components/ChartGrid";
import UploadWidget from "@/components/UploadWidget";
import SetupError from "@/components/SetupError";
import StatGrid from "@/components/StatGrid";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CHART_BUCKET } from "@/lib/storage";
import { computeDashboardStats } from "@/lib/stats";
import type { Chart, ChartAnalysis } from "@/lib/types";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  // RLS on both tables restricts these to the current user's own rows
  // regardless of what's queried here -- these filters are
  // belt-and-suspenders, not the actual security boundary. See
  // supabase/migrations/0001_init.sql.
  const [{ data: charts, error: chartsError }, { data: analyses }] =
    await Promise.all([
      supabase
        .from("charts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .returns<Chart[]>(),
      supabase
        .from("chart_analyses")
        .select("*")
        .eq("user_id", user.id)
        .returns<ChartAnalysis[]>(),
    ]);

  const analysesByChartId = new Map(
    (analyses ?? []).map((a) => [a.chart_id, a])
  );

  // The storage bucket is private (RLS-scoped per user), so viewing an
  // uploaded image needs a short-lived signed URL rather than a public one.
  const chartsWithUrls = await Promise.all(
    (charts ?? []).map(async (chart) => {
      const { data } = await supabase.storage
        .from(CHART_BUCKET)
        .createSignedUrl(chart.image_path, 60 * 10);
      return {
        chart,
        signedUrl: data?.signedUrl ?? null,
        analysis: analysesByChartId.get(chart.id) ?? null,
      };
    })
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <AppNav active="dashboard" />
      <main className="dash-main">
        <div className="container">
          <div className="dash-head">
            <div>
              <div className="eyebrow">Dashboard</div>
              <h1>Welcome back.</h1>
              <div className="dash-head__date">{today}</div>
            </div>
            <a className="btn btn--primary" href="#upload">
              Upload Chart
            </a>
          </div>
          {charts && charts.length > 0 ? (
            <StatGrid stats={computeDashboardStats(charts)} />
          ) : null}
          <UploadWidget />
          <div className="section-heading">
            <div className="eyebrow">Recent uploads</div>
          </div>
          {chartsError ? (
            <SetupError message={chartsError.message} />
          ) : (
            <ChartGrid items={chartsWithUrls} />
          )}
        </div>
      </main>
    </>
  );
}
