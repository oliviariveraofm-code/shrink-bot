import { useEffect, useRef, useState } from "react";
import "./propfirms-section.css";

interface Stat {
  label: string;
  target: number;
  suffix: string;
}

const STATS: Stat[] = [
  { label: "of blown funded accounts show revenge trading in the final week", target: 73, suffix: "%" },
  { label: "average hours from funded to first rule violation", target: 48, suffix: "h" },
  { label: "of flagged tilt sessions are caught before max drawdown", target: 91, suffix: "%" },
];

function useLoopingValue(target: number, cycleMs = 5200) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = (ts - startRef.current) % cycleMs;
      const rampMs = cycleMs * 0.4;
      let v: number;
      if (elapsed < rampMs) {
        v = (elapsed / rampMs) * target;
      } else {
        v = target;
      }
      setValue(Math.round(v));
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, cycleMs]);

  return value;
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const value = useLoopingValue(stat.target, 5000 + index * 600);
  return (
    <div className="stat-card">
      <div className="stat-card__number">
        {value}
        <span className="stat-card__suffix">{stat.suffix}</span>
      </div>
      <div className="stat-card__bar">
        <div
          className="stat-card__bar-fill"
          style={{ width: `${(value / stat.target) * 100}%` }}
        />
      </div>
      <p className="stat-card__label">{stat.label}</p>
    </div>
  );
}

export default function PropFirmsSection() {
  return (
    <section className="section propfirms-section" id="propfirms" data-section="propfirms">
      <svg className="propfirms-chart" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
        <path fill="none" stroke="#4FD1BE" strokeWidth="1.5" opacity="0.4">
          <animate
            attributeName="d"
            dur="7s"
            repeatCount="indefinite"
            values="M0,90 C60,70 100,100 160,60 S280,30 400,50;
                    M0,60 C60,100 100,40 160,80 S280,90 400,30;
                    M0,90 C60,70 100,100 160,60 S280,30 400,50"
          />
        </path>
        <path fill="none" stroke="#C4A052" strokeWidth="1.5" opacity="0.5">
          <animate
            attributeName="d"
            dur="9s"
            repeatCount="indefinite"
            values="M0,50 C80,20 120,90 200,60 S320,100 400,70;
                    M0,80 C80,100 120,20 200,40 S320,20 400,90;
                    M0,50 C80,20 120,90 200,60 S320,100 400,70"
          />
        </path>
      </svg>

      <div className="section-label">Data In Motion</div>
      <h2 className="section-title">Built for funded accounts.</h2>
      <p className="section-sub">
        Every rule maps to a real prop firm drawdown limit. FTMO, The5ers, FundedNext, Topstep — tracked automatically.
      </p>

      <div className="stats-grid">
        {STATS.map((s, i) => (
          <StatCard stat={s} index={i} key={s.label} />
        ))}
      </div>

      <button className="partner-cta">
        <span className="partner-cta__icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2 12l4-4 3 3 5-5 4 4-2 2M2 12l4 4 3-3 5 5 4-4-2-2" />
          </svg>
        </span>
        Partner with us
      </button>
    </section>
  );
}
