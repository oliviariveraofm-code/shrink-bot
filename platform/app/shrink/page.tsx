import AppNav from "@/components/AppNav";
import { requireUser } from "@/lib/auth";

const MOCK_STATS = [
  { label: "Trades logged", value: "0" },
  { label: "Patterns detected", value: "0" },
  { label: "Distance to prop-firm limits", value: "—" },
  { label: "Discipline score", value: "—" },
];

export default async function ShrinkPage() {
  await requireUser();

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

          <div className="badge badge--mock" style={{ marginTop: "28px" }}>
            MOCK DATA — REAL TRACKING COMING SOON
          </div>

          <div className="stat-grid">
            {MOCK_STATS.map((stat) => (
              <div key={stat.label} className="panel stat-panel">
                <div className="stat__value tabular">{stat.value}</div>
                <div className="stat__label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
