import { useState } from "react";
import LockSeal from "@/icons/LockSeal";

const FLOAT_VARIANTS = [
  { duration: "6.8s", delay: "0s", drift: "9px" },
  { duration: "7.9s", delay: "-1.8s", drift: "13px" },
  { duration: "6.1s", delay: "-3.1s", drift: "7px" },
];

export default function RulePanel({ rule, index }) {
  const isRed = rule.severity === "red";
  const float = FLOAT_VARIANTS[index % FLOAT_VARIANTS.length];
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setFlipped((f) => !f)}
      className={`rule-flip-outer h-56 cursor-pointer ${flipped ? "is-flipped" : ""}`}
      style={{ "--float-duration": float.duration, "--float-delay": float.delay, "--float-drift": float.drift }}
    >
      <div className="agent-card-float h-full">
        <div className="rule-flip-inner">
          {/* Front — locked */}
          <div
            className={`rule-face flex flex-col items-center justify-center rounded-2xl border px-5 text-center ${
              isRed ? "rule-red-pulse border-[var(--color-red)]/40" : "border-[var(--color-gold)]/25"
            }`}
            style={{
              background: "linear-gradient(160deg, rgba(25,27,34,0.92), rgba(14,15,19,0.96))",
            }}
          >
            <span className="font-mono-num text-[0.62rem] tracking-widest text-[var(--color-ink-faint)]">
              RULE {rule.n}
            </span>
            <LockSeal className={`my-3 h-10 w-10 ${isRed ? "text-[var(--color-red)]" : "text-[var(--color-gold)]"}`} />
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">{rule.title}</h3>
            <span className="mt-3 text-[0.6rem] uppercase tracking-[0.25em] text-[var(--color-ink-faint)]">
              {isRed ? "Enforced" : "Locked"}
            </span>
          </div>

          {/* Back — revealed text */}
          <div
            className={`rule-face rule-face-back flex flex-col justify-center rounded-2xl border px-6 py-6 ${
              isRed ? "border-[var(--color-red)]/50" : "border-[var(--color-teal)]/40"
            }`}
            style={{
              background: "linear-gradient(160deg, rgba(20,22,28,0.97), rgba(10,11,14,0.98))",
            }}
          >
            <span
              className="eyebrow rule-back-text"
              style={{ color: isRed ? "var(--color-red)" : "var(--color-teal)" }}
            >
              Rule {rule.n}
            </span>
            <p className="rule-back-text mt-3 text-[0.82rem] leading-relaxed text-[var(--color-ink)]">
              {rule.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
