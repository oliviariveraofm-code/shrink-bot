import { RULES } from "@/data/rules";
import RulePanel from "./RulePanel";

export default function RulesSection() {
  return (
    <section id="rules" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="eyebrow">The Floor Rules</div>
          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
            Ten rules. <span className="text-gradient-gold">Zero discretion.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--color-ink-dim)] sm:text-base">
            Sealed until you hover. Red rules are enforced automatically — no appeal, no override.
          </p>
        </div>

        <div className="mx-auto mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {RULES.map((rule, i) => (
            <RulePanel key={rule.n} rule={rule} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
