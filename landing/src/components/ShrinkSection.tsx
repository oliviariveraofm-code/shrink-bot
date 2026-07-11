import { useEffect, useMemo, useState } from "react";
import "./shrink-section.css";

const PHRASES = ["Revenge detected.", "Overtrading blocked.", "Pattern logged.", "Cooldown enforced."];

const VITALS_POINTS: [number, number][] = [
  [0, 45], [60, 45], [80, 45], [92, 15], [104, 75], [116, 45], [140, 45], [200, 45],
  [220, 45], [232, 20], [244, 68], [256, 45], [280, 45], [340, 45], [360, 45], [372, 15],
  [384, 75], [396, 45], [420, 45], [480, 45], [500, 45], [512, 20], [524, 68], [536, 45],
  [560, 45], [600, 45],
];

const VITALS_AMBIENT_POINTS: [number, number][] = [
  [0, 45], [50, 38], [100, 50], [150, 40], [200, 47], [250, 36], [300, 48], [350, 39],
  [400, 46], [450, 37], [500, 49], [550, 40], [600, 45],
];

const toPolylinePoints = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(" ");
const toPathD = (pts: [number, number][]) => pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");

function useFakeCountdown() {
  const [seconds, setSeconds] = useState(24 * 3600 - 3134);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 0) {
          setActive((a) => !a);
          return active ? 0 : 24 * 3600 - 1;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h, m, s, active };
}

function FlipUnit({ value }: { value: number }) {
  const padded = value.toString().padStart(2, "0");
  return <span className="flip-unit" key={padded}>{padded}</span>;
}

export default function ShrinkSection() {
  const { h, m, s, active } = useFakeCountdown();
  const [spike, setSpike] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setSpike(true);
      setTimeout(() => setSpike(false), 700);
    }, 6000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, []);

  const spikePoints = useMemo(() => toPolylinePoints(VITALS_POINTS), []);
  const ambientPoints = useMemo(() => toPolylinePoints(VITALS_AMBIENT_POINTS), []);
  const spikePathD = useMemo(() => toPathD(VITALS_POINTS), []);

  return (
    <section className="section shrink-section" id="shrink" data-section="shrink">
      <div className="section-label">The Living Core</div>
      <h2 className="section-title">The Shrink never blinks.</h2>
      <p className="section-sub">
        Behavioral pattern analysis, running continuously. Cold, clinical, and impossible to argue with.
      </p>

      <div className="shrink-core">
        <div className={`shrink-timer ${active ? "shrink-timer--active" : "shrink-timer--clear"}`}>
          <div className="shrink-timer__ring" />
          <div className="shrink-timer__inner">
            <span className="shrink-timer__label">{active ? "ENFORCEMENT" : "CLEAR"}</span>
            <div className="shrink-timer__digits">
              <FlipUnit value={h} />:<FlipUnit value={m} />:<FlipUnit value={s} />
            </div>
          </div>
        </div>

        {PHRASES.map((phrase, i) => (
          <div
            className="shrink-phrase"
            key={phrase}
            style={{ animationDelay: `${i * 3}s` }}
          >
            {phrase}
          </div>
        ))}
      </div>

      <div className={`vitals-panel ${spike ? "vitals-panel--spike" : ""}`}>
        <span className="vitals-panel__corner vitals-panel__corner--tl" />
        <span className="vitals-panel__corner vitals-panel__corner--tr" />
        <span className="vitals-panel__corner vitals-panel__corner--bl" />
        <span className="vitals-panel__corner vitals-panel__corner--br" />

        <div className="vitals-panel__header">
          <span className="vitals-panel__title">Neural activity</span>
          <span className="vitals-panel__status">
            <span className="vitals-panel__dot" />
            {spike ? "Spike detected" : "Stable"}
          </span>
        </div>

        <div className="vitals-panel__grid" />

        <svg viewBox="0 0 600 90" preserveAspectRatio="none" className="vitals-svg">
          <defs>
            <linearGradient id="vitalsLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4FD1BE" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#C4A052" stopOpacity="1" />
              <stop offset="100%" stopColor="#4FD1BE" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <polyline className="vitals-line vitals-line--ambient" fill="none" points={ambientPoints} />
          <polyline className="vitals-line vitals-line--spike" fill="none" points={spikePoints} />
        </svg>

        <div className="vitals-comet" style={{ offsetPath: `path('${spikePathD}')` } as React.CSSProperties} />
      </div>
    </section>
  );
}
