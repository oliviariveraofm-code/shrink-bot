import { useMemo } from "react";
import "./pricing-section.css";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    tagline: "See the room work.",
    features: ["Public agent commentary", "Delayed session windows", "Community Discord access"],
    accent: "gold" as const,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    tagline: "Full twelve-agent consensus.",
    features: ["Real-time agent consensus", "The Shrink behavioral analysis", "Prime window alerts", "Prop firm rule tracking"],
    accent: "teal" as const,
  },
  {
    name: "Elite",
    price: "$99",
    period: "/mo",
    tagline: "Every signal, zero delay.",
    features: ["Everything in Pro", "Priority signal delivery", "1:1 pattern review sessions", "Direct prop firm partner rates", "Custom enforcement thresholds"],
    accent: "elite" as const,
  },
];

function useFloatSymbols(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        symbol: i % 2 === 0 ? "$" : "%",
        left: Math.random() * 100,
        duration: 10 + Math.random() * 8,
        delay: Math.random() * -14,
        size: 0.8 + Math.random() * 1.4,
      })),
    [count]
  );
}

export default function PricingSection() {
  const symbols = useFloatSymbols(18);

  return (
    <section className="section pricing-section" id="pricing" data-section="pricing">
      <div className="pricing-symbols" aria-hidden="true">
        {symbols.map((s, i) => (
          <span
            key={i}
            className="pricing-symbol"
            style={{
              left: `${s.left}%`,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              fontSize: `${s.size}rem`,
            }}
          >
            {s.symbol}
          </span>
        ))}
      </div>

      <div className="section-label">Floating Tiers</div>
      <h2 className="section-title">Pick your access to the floor.</h2>
      <p className="section-sub">No hidden tiers. No fake urgency. Just the room, at different depths.</p>

      <div className="pricing-grid">
        {TIERS.map((tier, i) => (
          <div className={`pricing-cell pricing-cell--${i}`} key={tier.name}>
            <div className={`pricing-card pricing-card--${tier.accent}`}>
              {tier.accent === "elite" && <div className="pricing-chase" />}
              <div className="pricing-card__inner">
                <div className="pricing-card__name">{tier.name}</div>
                <div className="pricing-card__price">
                  {tier.price}
                  <span className="pricing-card__period">{tier.period}</span>
                </div>
                <p className="pricing-card__tagline">{tier.tagline}</p>
                <ul className="pricing-card__features">
                  {tier.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button className="pricing-card__cta">Choose {tier.name}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
