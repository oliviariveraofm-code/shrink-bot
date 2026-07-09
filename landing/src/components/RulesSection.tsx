import "./rules-section.css";

interface Rule {
  id: string;
  title: string;
  text: string;
  warning?: boolean;
}

const RULES: Rule[] = [
  { id: "R01", title: "No revenge trades", text: "Any entry within 15 minutes of a loss, on the same instrument, is blocked pending review.", warning: true },
  { id: "R02", title: "No size doubling", text: "Position size cannot increase after a loss in the same session. Ever.", warning: true },
  { id: "R03", title: "Consensus required", text: "A call needs agreement from at least 8 of 12 agents before it reaches you." },
  { id: "R04", title: "One setup per session", text: "Additional entries must wait for the next qualifying window." },
  { id: "R05", title: "Hard stop, no exceptions", text: "Stops are placed before entry and never widened once live." },
  { id: "R06", title: "Daily loss limit respected", text: "At 75% of daily drawdown, new entries are suspended for the session." },
  { id: "R07", title: "Log every trade", text: "No journal entry, no next signal. The pattern data has to stay complete." },
  { id: "R08", title: "24h cooldown on tilt", text: "Detected spiral language triggers a mandatory 24-hour enforcement block.", warning: true },
  { id: "R09", title: "Prime windows only", text: "Entries outside identified high-probability windows require manual override." },
  { id: "R10", title: "Weekly review, no skipping", text: "Sunday pattern review is mandatory before Monday's first signal unlocks." },
];

export default function RulesSection() {
  return (
    <section className="section rules-section" id="rules" data-section="rules">
      <div className="section-label">Locked In Motion</div>
      <h2 className="section-title">Ten rules. Not suggestions.</h2>
      <p className="section-sub">The Shrink enforces these without exception. Red means it's already watching for it.</p>

      <div className="rules-grid">
        {RULES.map((rule, i) => (
          <div className="rule-cell" key={rule.id} style={{ animationDelay: `${(i * 0.37) % 5}s` }}>
            <div className="rule-drift">
              <div className={`rule-flip ${rule.warning ? "rule-flip--warning" : ""}`} tabIndex={0}>
                <div className="rule-face rule-face--front">
                  <div className="rule-seal" />
                  <div className="rule-code">{rule.id}</div>
                  <div className="rule-title">{rule.title}</div>
                  <div className="rule-holo" />
                </div>
                <div className="rule-face rule-face--back">
                  <div className="rule-code rule-code--small">{rule.id}</div>
                  <p className="rule-text">{rule.text}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
