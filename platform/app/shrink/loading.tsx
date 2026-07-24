import AppNav from "@/components/AppNav";

export default function Loading() {
  return (
    <>
      <AppNav active="shrink" />
      <main className="dash-main">
        <div className="container">
          <div className="eyebrow">The 5th Agent</div>
          <h1 style={{ marginTop: "8px" }}>The Shrink.</h1>
          <div className="stat-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="panel stat-panel">
                <div
                  className="skeleton"
                  style={{ height: "38px", width: "50%", marginBottom: "10px" }}
                />
                <div className="skeleton" style={{ height: "13px", width: "80%" }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
