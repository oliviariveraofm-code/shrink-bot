import { useEffect, useMemo, useState } from "react";
import { subscribeIntro, getIntroPhase } from "../lib/introState";
import MagneticButton from "./MagneticButton";
import "./hero.css";

const HEADLINE = "Twelve agents. One analysis. No call without consensus.";

export default function Hero({ onOpenLogin }: { onOpenLogin: () => void }) {
  const [phase, setPhase] = useState(getIntroPhase());

  useEffect(() => subscribeIntro(() => setPhase(getIntroPhase())), []);

  const words = useMemo(() => HEADLINE.split(" "), []);
  const active = phase === "revealed";
  let letterIndex = 0;

  return (
    <section className="hero-section" id="top" data-section="hero">
      <div className="hero-spacer" />
      <h1 className={`hero-headline ${active ? "is-active" : ""}`} aria-label={HEADLINE}>
        {words.map((word, wi) => (
          <span className="hero-word" key={wi}>
            {word.split("").map((ch, ci) => {
              const delay = letterIndex * 0.028;
              letterIndex += 1;
              return (
                <span key={ci} className="hero-letter" style={{ animationDelay: `${delay}s` }}>
                  {ch}
                </span>
              );
            })}
            {wi < words.length - 1 ? " " : ""}
          </span>
        ))}
      </h1>
      <p className={`hero-kicker ${active ? "is-active" : ""}`}>
        THE SHRINK is watching. Twelve specialist agents feed it. Nothing trades without the room agreeing.
      </p>
      <div className={`hero-ctas ${active ? "is-active" : ""}`}>
        <MagneticButton className="cta cta--gold" href="#" ariaLabel="Join Discord">
          Join Discord
        </MagneticButton>
        <MagneticButton className="cta cta--teal" onClick={onOpenLogin} ariaLabel="Enter The Floor">
          Enter The Floor
        </MagneticButton>
      </div>
      <div className="hero-scroll-hint">
        <span>SCROLL</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  );
}
