export interface Agent {
  id: string;
  name: string;
  color: string;
  role: string;
  desc: string;
}

export const AGENTS: Agent[] = [
  { id: "rally", name: "RALLY", color: "#4FB477", role: "Momentum Reader", desc: "Tracks trend strength and breakout momentum across timeframes." },
  { id: "crash", name: "CRASH", color: "#E0524E", role: "Downside Risk", desc: "Flags structural breakdowns and volatility spikes before they cascade." },
  { id: "vector", name: "VECTOR", color: "#4F8FE0", role: "Directional Bias", desc: "Aligns price action with higher-timeframe directional pressure." },
  { id: "tempo", name: "TEMPO", color: "#E0954F", role: "Session Timing", desc: "Maps volume rhythm to identify high-probability execution windows." },
  { id: "hunt", name: "HUNT", color: "#9FC74A", role: "Liquidity Scout", desc: "Locates resting liquidity and stop clusters before price reacts." },
  { id: "sniper", name: "SNIPER", color: "#38C2BD", role: "Entry Precision", desc: "Confirms entry timing with tight invalidation and confluence checks." },
  { id: "macro", name: "MACRO", color: "#6E72D4", role: "Macro Context", desc: "Filters setups against the prevailing macro and rate regime." },
  { id: "hedge", name: "HEDGE", color: "#8E97A3", role: "Correlation Risk", desc: "Watches cross-asset correlation to prevent hidden overexposure." },
  { id: "flow", name: "FLOW", color: "#3FB89A", role: "Order Flow", desc: "Reads real-time order flow imbalance for confirmation signals." },
  { id: "sentiment", name: "SENTIMENT", color: "#E060A8", role: "Crowd Psychology", desc: "Measures positioning extremes and retail sentiment skew." },
  { id: "oracle", name: "ORACLE", color: "#9B6FE0", role: "Pattern Memory", desc: "Cross-references live setups against historical pattern outcomes." },
  { id: "shrink", name: "SHRINK", color: "#DCE3ED", role: "Behavioral Enforcer", desc: "Analyzes trader behavior. Detects tilt. Enforces cooldowns without exception." },
];

export const AGENT_COUNT = AGENTS.length;
