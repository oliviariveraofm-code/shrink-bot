import "./sessions-section.css";

interface SessionWindow {
  label: string;
  time: string;
  kind: "prime" | "normal" | "dead";
}

const WINDOWS: SessionWindow[] = [
  { label: "Asian Open", time: "00:00–03:00", kind: "normal" },
  { label: "London Open", time: "08:00–10:00", kind: "prime" },
  { label: "Midday Chop", time: "11:00–13:00", kind: "dead" },
  { label: "NY Overlap", time: "13:00–16:00", kind: "prime" },
  { label: "NY PM Drift", time: "18:00–20:00", kind: "dead" },
  { label: "Late Session", time: "21:00–23:00", kind: "normal" },
];

const RIBBON_PATH = "M -50 60 C 150 10, 350 110, 550 50 S 850 -10, 1050 60";

export default function SessionsSection() {
  return (
    <section className="section sessions-section" id="sessions" data-section="sessions">
      <div className="section-label">Time In Motion</div>
      <h2 className="section-title">Not every hour deserves a trade.</h2>
      <p className="section-sub">
        Prime windows glow. Dead zones pull volume in and give nothing back. Trade the ribbon, not the clock.
      </p>

      <div className="ribbon-stage">
        <svg className="ribbon-svg" viewBox="0 0 1000 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4FD1BE" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#C4A052" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4FD1BE" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path d={RIBBON_PATH} fill="none" stroke="url(#ribbonGrad)" strokeWidth="2.5" className="ribbon-path-base" />
          <path d={RIBBON_PATH} fill="none" stroke="#fff6df" strokeWidth="2" className="ribbon-path-flow" />
        </svg>

        <div className="ribbon-comet" style={{ offsetPath: `path('${RIBBON_PATH}')` } as React.CSSProperties} />

        <div className="ribbon-markers">
          {WINDOWS.map((w, i) => (
            <div className={`ribbon-marker ribbon-marker--${w.kind}`} key={w.label} style={{ animationDelay: `${i * 0.4}s` }}>
              <div className="ribbon-marker__shape" />
              <div className="ribbon-marker__label">{w.label}</div>
              <div className="ribbon-marker__time">{w.time}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
