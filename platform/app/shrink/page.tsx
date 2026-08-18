import AppNav from "@/components/AppNav";
import StatGrid from "@/components/StatGrid";
import ShrinkChat from "@/components/ShrinkChat";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { computeShrinkStats } from "@/lib/stats";
import type { Chart, ChartAnalysis, ShrinkMessage } from "@/lib/types";

const STILL_MOCK_STATS = [
  { label: "Distance to prop-firm limits", value: "—" },
  { label: "Discipline score", value: "—" },
];

export default async function ShrinkPage() {
  const user = await requireUser();
  const supabase = await createClient();

  // RLS on every table here restricts these to the current user's own
  // rows regardless of what's queried -- belt-and-suspenders, not the
  // actual boundary. See supabase/migrations/.
  const [{ data: charts }, { data: analyses }, { data: chatHistory }] =
    await Promise.all([
      supabase
        .from("charts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500)
        .returns<Chart[]>(),
      supabase
        .from("chart_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200)
        .returns<ChartAnalysis[]>(),
      supabase
        .from("shrink_messages")
        .select("role, content, source, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50)
        .returns<Pick<ShrinkMessage, "role" | "content" | "source" | "created_at">[]>(),
    ]);

  return (
    <>
      <AppNav active="shrink" />
      <main className="dash-main">
        <div className="container">
          <div className="eyebrow">The 5th Agent</div>
          <h1 style={{ marginTop: "8px" }}>The Shrink.</h1>
          <p className="lede" style={{ marginTop: "16px" }}>
            The Shrink watches every trade you log and every chart you
            upload, tracking behavioral patterns over time -- not just
            individual calls.
          </p>

          <div className="section-heading" style={{ marginTop: "40px" }}>
            <div className="eyebrow">Your activity</div>
          </div>
          <div className="badge badge--live" style={{ marginBottom: "20px" }}>
            LIVE — FROM YOUR ACTUAL UPLOAD ACTIVITY
          </div>
          <StatGrid stats={computeShrinkStats(charts ?? [], analyses ?? [])} />

          <div className="section-heading">
            <div className="eyebrow">Still coming</div>
          </div>
          <div className="badge badge--mock" style={{ marginBottom: "20px" }}>
            MOCK DATA — REQUIRES TRADE OUTCOME TRACKING, COMING SOON
          </div>
          <StatGrid stats={STILL_MOCK_STATS} />

          <div className="section-heading">
            <div className="eyebrow">The 5th agent, live</div>
          </div>
          <ShrinkChat initialMessages={chatHistory ?? []} />
        </div>
      </main>
    </>
  );
}
