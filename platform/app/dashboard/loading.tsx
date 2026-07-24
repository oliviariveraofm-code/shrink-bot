import AppNav from "@/components/AppNav";

export default function Loading() {
  return (
    <>
      <AppNav active="dashboard" />
      <main className="dash-main">
        <div className="container">
          <div className="dash-head">
            <div>
              <div className="eyebrow">Dashboard</div>
              <h1>Welcome back.</h1>
            </div>
          </div>
          <div className="skeleton" style={{ height: "120px", marginBottom: "44px" }} />
          <div className="chart-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="panel chart-card">
                <div className="skeleton chart-card__thumb" />
                <div className="skeleton" style={{ height: "13px", width: "60%" }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
