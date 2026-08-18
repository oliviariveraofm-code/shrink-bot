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
              <div className="skeleton" style={{ height: "14px", width: "160px", marginTop: "10px" }} />
            </div>
          </div>
          <div className="stat-grid" style={{ marginTop: 0, marginBottom: "56px" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="panel stat-panel">
                <div className="skeleton" style={{ height: "34px", width: "50%", marginBottom: "10px" }} />
                <div className="skeleton" style={{ height: "13px", width: "70%" }} />
              </div>
            ))}
          </div>
          <div className="skeleton" style={{ height: "160px", marginBottom: "56px", borderRadius: "8px" }} />
          <div className="section-heading">
            <div className="eyebrow">Recent uploads</div>
          </div>
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
