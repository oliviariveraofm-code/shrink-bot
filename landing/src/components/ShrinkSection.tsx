import { useEffect, useState } from "react";
import "./shrink-section.css";

const PHRASES = ["Revenge detected.", "Overtrading blocked.", "Pattern logged.", "Cooldown enforced."];

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

      <div className={`ecg-wrap ${spike ? "ecg-wrap--spike" : ""}`}>
        <svg viewBox="0 0 600 80" preserveAspectRatio="none" className="ecg-svg">
          <polyline
            className="ecg-line"
            fill="none"
            points="0,40 60,40 80,40 92,10 104,70 116,40 140,40 200,40 220,40 232,18 244,62 256,40 280,40 340,40 360,40 372,10 384,70 396,40 420,40 480,40 500,40 512,18 524,62 536,40 560,40 600,40"
          />
        </svg>
      </div>
    </section>
  );
}
