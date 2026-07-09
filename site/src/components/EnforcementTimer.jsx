import { useEffect, useState } from "react";

const TOTAL_SECONDS = 24 * 60 * 60;
const CIRC = 2 * Math.PI * 54;

export default function EnforcementTimer() {
  const [remaining, setRemaining] = useState(24 * 3600 - 60 * 61 - 34);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => (r <= 0 ? TOTAL_SECONDS : r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pct = remaining / TOTAL_SECONDS;
  const offset = CIRC * (1 - pct);
  const h = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(remaining % 60)).padStart(2, "0");

  return (
    <div className="mx-auto flex flex-col items-center" style={{ perspective: "900px" }}>
      <div
        className="relative h-56 w-56 transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: "rotateX(18deg) rotateY(-8deg)" }}
      >
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="url(#enforce-grad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear", filter: "drop-shadow(0 0 8px rgba(209,82,79,0.55))" }}
          />
          <defs>
            <linearGradient id="enforce-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d1524f" />
              <stop offset="100%" stopColor="#e8c774" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center [transform:translateZ(30px)]">
          <span className="font-mono text-[0.55rem] tracking-[0.2em] text-[var(--color-red)] uppercase">
            Suspension Active
          </span>
          <span className="mt-2 font-mono-num text-3xl font-semibold tabular-nums text-[var(--color-ink)]">
            {h}:{m}:{s}
          </span>
          <span className="mt-1 text-[0.58rem] uppercase tracking-wide text-[var(--color-ink-faint)]">
            Until re-entry unlocked
          </span>
        </div>
      </div>
    </div>
  );
}
