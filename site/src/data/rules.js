export const RULES = [
  {
    n: "01",
    title: "Plan Before Position",
    severity: "gold",
    text:
      "No trade is valid without a documented plan logged before the session opens. Entries without a prior plan are marked unplanned in the record — permanently.",
  },
  {
    n: "02",
    title: "The Fifteen-Minute Rule",
    severity: "red",
    text:
      "No re-entry within fifteen minutes of a stopped-out trade. Trades taken inside the window are flagged as revenge entries and tracked separately in your win-rate history.",
  },
  {
    n: "03",
    title: "Three-Loss Suspension",
    severity: "red",
    text:
      "Three consecutive losses trigger a mandatory 24-hour trading suspension, enforced automatically. The suspension is not a suggestion and cannot be appealed mid-cycle.",
  },
  {
    n: "04",
    title: "Every Loss Gets Answered",
    severity: "gold",
    text:
      "Every loss posted in #losses is answered within one hour: plan adherence, mental state score, timing since last loss. Silence is logged as evasion.",
  },
  {
    n: "05",
    title: "75%, Not 100%",
    severity: "gold",
    text:
      "Daily loss limits are enforced at 75% of your prop firm's threshold, not the firm's actual number. The last 25% is not yours to spend.",
  },
  {
    n: "06",
    title: "Mental State Floor",
    severity: "red",
    text:
      "A pre-session mental state score below 4 blocks new entries until reassessed. The floor does not negotiate with conviction.",
  },
  {
    n: "07",
    title: "Size Is Fixed Pre-Session",
    severity: "gold",
    text:
      "Position size is set before the session starts. Any mid-session increase requires explicit sign-off from the Risk Officer — no exceptions for a trade that 'feels right.'",
  },
  {
    n: "08",
    title: "Spiral Keywords Are Logged",
    severity: "red",
    text:
      "Certain language — revenge, tilt, doubled down, one more — triggers an automatic behavioral flag visible only to The Shrink. No action is required. No action goes unnoticed.",
  },
  {
    n: "09",
    title: "No Averaging Down",
    severity: "red",
    text:
      "No martingale, no averaging into losers, no 'it'll come back.' These are structural violations of the system, not trading opinions open to debate.",
  },
  {
    n: "10",
    title: "Eight of Twelve",
    severity: "gold",
    text:
      "Consensus requires eight of twelve agents in agreement before a call is issued. Fewer than eight is not a weak signal — it is no signal at all.",
  },
];
