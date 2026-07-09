// 24-hour session map, UTC. `t` is position along the timeline (0–1).
export const SESSIONS = [
  {
    id: "asia-dead",
    label: "Asian Range",
    type: "dead",
    start: 0,
    end: 6,
    note: "Thin liquidity, wide spreads. Historically the floor's lowest expectancy window.",
  },
  {
    id: "london-pre",
    label: "London Pre-Open",
    type: "secondary",
    start: 6,
    end: 8,
    note: "Positioning builds. Structure forms but confirmation is thin.",
  },
  {
    id: "london-open",
    label: "London Open",
    type: "prime",
    start: 8,
    end: 11,
    note: "Prime window. Volume and volatility expand together — the floor's first real edge of the day.",
  },
  {
    id: "london-lull",
    label: "London Lull",
    type: "dead",
    start: 11,
    end: 12.5,
    note: "Pre-New York chop. Setups here fail more than they resolve.",
  },
  {
    id: "ny-overlap",
    label: "NY / London Overlap",
    type: "prime",
    start: 12.5,
    end: 16,
    note: "The floor's strongest window. Maximum participation, maximum conviction, maximum discipline required.",
  },
  {
    id: "ny-pm",
    label: "New York PM",
    type: "secondary",
    start: 16,
    end: 18,
    note: "London desks thin out. Edge decays but doesn't disappear.",
  },
  {
    id: "ny-close",
    label: "New York Close",
    type: "secondary",
    start: 18,
    end: 21,
    note: "Position squaring dominates. Read direction carefully — it is often not conviction, it is flow.",
  },
  {
    id: "post-close",
    label: "Post-Close",
    type: "dead",
    start: 21,
    end: 24,
    note: "Dead zone. The floor does not size up here — it reviews the day and logs the debrief.",
  },
];

export const SESSION_COLORS = {
  prime: "#c4a052",
  secondary: "#4fd1be",
  dead: "#3a3b44",
};
