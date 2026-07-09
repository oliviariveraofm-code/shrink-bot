// The twelve agents of The Trading Floor.
// Colors stay within the gold / teal institutional palette, with a few
// desaturated accent hues for differentiation and a single red for risk-flagged agents.
export const AGENTS = [
  {
    n: "01",
    id: "chair",
    name: "The Chair",
    role: "Consensus Arbiter",
    color: "#e8c774",
    summary:
      "Holds the floor. Aggregates all eleven votes and refuses to issue a call until quorum is met.",
    detail:
      "Does not analyze markets directly. Weighs conflicting reads, tracks agreement thresholds, and blocks execution when consensus falls below 8 of 12.",
    tags: ["Consensus", "Governance", "Veto"],
  },
  {
    n: "02",
    id: "macro",
    name: "The Macro",
    role: "Macro & Fundamentals",
    color: "#c4a052",
    summary:
      "Reads central bank policy, rate differentials, and cross-asset flow before a single chart is opened.",
    detail:
      "Filters setups against the macro regime. A technically perfect trade against the macro tide gets flagged, not blocked.",
    tags: ["Rates", "Policy", "Flows"],
  },
  {
    n: "03",
    id: "technician",
    name: "The Technician",
    role: "Price Action & Structure",
    color: "#4fd1be",
    summary: "Market structure, liquidity pools, and confirmation. No indicator lag, no lagging opinions.",
    detail:
      "Maps structure across four timeframes simultaneously and requires alignment before structure is called valid.",
    tags: ["Structure", "Liquidity", "Confirmation"],
  },
  {
    n: "04",
    id: "quant",
    name: "The Quant",
    role: "Statistical Edge",
    color: "#7ee8d6",
    summary: "Runs every setup against historical expectancy before conviction is allowed to matter.",
    detail:
      "No edge, no vote. If the sample size is too thin to be statistically meaningful, The Quant abstains — loudly.",
    tags: ["Expectancy", "Backtest", "Sample Size"],
  },
  {
    n: "05",
    id: "shrink",
    name: "The Shrink",
    role: "Behavioral Pattern Analyst",
    color: "#d1524f",
    summary:
      "Not a therapist. Not a coach. Analyzes trader behavior data and reports patterns without sympathy.",
    detail:
      "Detects revenge trading, overtrading, time-of-day destruction, drawdown spirals, post-win overconfidence, and prop-limit proximity. The data does not care how you feel about it.",
    tags: ["Behavior", "Pattern Detection", "Enforcement"],
  },
  {
    n: "06",
    id: "risk",
    name: "The Risk Officer",
    role: "Position Sizing & Exposure",
    color: "#b98f3f",
    summary: "Sizes every position before entry and has unilateral authority to reduce size mid-session.",
    detail:
      "Tracks daily and total drawdown against prop firm limits in real time. Escalates from caution to critical to breached — no discretion at 100%.",
    tags: ["Drawdown", "Sizing", "Prop Limits"],
  },
  {
    n: "07",
    id: "scanner",
    name: "The Scanner",
    role: "Setup Discovery",
    color: "#4fd1be",
    summary: "Sweeps the full watchlist continuously, surfacing only what clears every other agent's floor.",
    detail:
      "Pre-filters noise so the other eleven agents only spend cycles on setups worth a vote.",
    tags: ["Screening", "Watchlist", "Signal"],
  },
  {
    n: "08",
    id: "historian",
    name: "The Historian",
    role: "Precedent & Pattern History",
    color: "#c4a052",
    summary: "Cross-references the current setup against every prior instance in the archive.",
    detail:
      "Surfaces how this exact pattern has resolved historically, including the losses everyone would rather forget.",
    tags: ["Archive", "Precedent", "Memory"],
  },
  {
    n: "09",
    id: "sentinel",
    name: "The Sentinel",
    role: "News & Event Risk",
    color: "#e8c774",
    summary: "Watches the calendar so no one gets run over by a print they forgot was scheduled.",
    detail:
      "Freezes new entries ahead of high-impact releases and flags positions still open into the window.",
    tags: ["Calendar", "Volatility", "Event Risk"],
  },
  {
    n: "10",
    id: "executioner",
    name: "The Executioner",
    role: "Execution & Order Flow",
    color: "#4fd1be",
    summary: "Converts consensus into orders. Entry, stop, and target — placed exactly as agreed, nothing improvised.",
    detail:
      "Monitors slippage and fill quality, and reports execution deviation back to The Auditor without exception.",
    tags: ["Orders", "Fills", "Slippage"],
  },
  {
    n: "11",
    id: "contrarian",
    name: "The Contrarian",
    role: "Adversarial Review",
    color: "#d1524f",
    summary: "Argues against every setup that reaches a vote. If the case survives, it earns the vote.",
    detail:
      "Structurally incapable of agreement on the first pass. Exists to stress-test consensus before capital moves.",
    tags: ["Devil's Advocate", "Stress Test", "Bias Check"],
  },
  {
    n: "12",
    id: "auditor",
    name: "The Auditor",
    role: "Compliance & Journaling",
    color: "#9a9aa2",
    summary: "Logs every decision, every deviation, every override — timestamped and unarguable.",
    detail:
      "Closes the loop after execution: planned versus actual, pattern match, and one declarative observation. No exceptions logged as exceptions.",
    tags: ["Journaling", "Audit Trail", "Debrief"],
  },
];
