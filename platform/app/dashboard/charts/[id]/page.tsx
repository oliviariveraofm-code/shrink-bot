import { notFound } from "next/navigation";
import AppNav from "@/components/AppNav";
import TradeCardMock from "@/components/TradeCardMock";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CHART_BUCKET } from "@/lib/storage";
import type { Chart, MockAnalysis } from "@/lib/types";

export default async function ChartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  // RLS also enforces this -- the .eq("user_id", ...) here is a second,
  // redundant check, not the actual boundary preventing cross-user access.
  const { data: chart } = await supabase
    .from("charts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single<Chart>();

  if (!chart) {
    notFound();
  }

  const [{ data: signedUrlData }, { data: analysis }] = await Promise.all([
    supabase.storage.from(CHART_BUCKET).createSignedUrl(chart.image_path, 60 * 10),
    supabase
      .from("mock_analyses")
      .select("*")
      .eq("chart_id", chart.id)
      .maybeSingle<MockAnalysis>(),
  ]);

  return (
    <>
      <AppNav active="dashboard" />
      <main className="dash-main">
        <div className="container">
          <div className="eyebrow">Chart</div>
          <h1 style={{ marginTop: "8px", marginBottom: "36px" }}>
            {new Date(chart.created_at).toLocaleString()}
          </h1>

          <div className="anat__split">
            <div>
              {signedUrlData?.signedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={signedUrlData.signedUrl}
                  alt="Uploaded chart"
                  style={{
                    width: "100%",
                    borderRadius: "6px",
                    border: "1px solid rgba(166,166,168,.22)",
                  }}
                />
              ) : null}
            </div>
            <div>
              {analysis ? (
                <TradeCardMock analysis={analysis} />
              ) : (
                <div className="panel">
                  <div className="panel__label">Status</div>
                  <p>Waiting on analysis.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
