import AppNav from "@/components/AppNav";

export default function Loading() {
  return (
    <>
      <AppNav active="dashboard" />
      <main className="dash-main">
        <div className="container">
          <div className="eyebrow">Chart</div>
          <div
            className="skeleton"
            style={{ height: "38px", width: "260px", marginTop: "8px", marginBottom: "36px" }}
          />
          <div className="anat__split">
            <div className="skeleton" style={{ aspectRatio: "16/10", borderRadius: "6px" }} />
            <div className="panel">
              <div className="skeleton" style={{ height: "11px", width: "40%", marginBottom: "16px" }} />
              <div className="skeleton" style={{ height: "14px", marginBottom: "10px" }} />
              <div className="skeleton" style={{ height: "14px", marginBottom: "10px" }} />
              <div className="skeleton" style={{ height: "14px", width: "70%" }} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
