import type { Chart, ChartAnalysis } from "@/lib/types";
import type { Stat } from "@/components/StatGrid";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Most frequent value in a list, or null if the list is empty. */
function mode(values: string[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: string | null = null;
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

/**
 * Real (not mock) activity stats -- charts is assumed sorted newest-first.
 * Kept deliberately simple: counts and averages over what's actually
 * logged, nothing inferred or predicted. "Discipline score" and similar
 * outcome-based metrics aren't here because trade outcomes (win/loss,
 * P&L) aren't tracked yet -- see the still-mock stats on /shrink.
 */
export function computeDashboardStats(charts: Chart[]): Stat[] {
  const weekStart = Date.now() - WEEK_MS;
  const thisWeek = charts.filter(
    (c) => new Date(c.created_at).getTime() >= weekStart
  ).length;
  const last = charts[0];

  return [
    { label: "Charts uploaded", value: String(charts.length) },
    { label: "This week", value: String(thisWeek) },
    { label: "Last upload", value: last ? timeAgo(last.created_at) : "—" },
  ];
}

export function computeShrinkStats(
  charts: Chart[],
  analyses: ChartAnalysis[]
): Stat[] {
  const weekStart = Date.now() - WEEK_MS;
  const thisWeek = charts.filter(
    (c) => new Date(c.created_at).getTime() >= weekStart
  ).length;
  const last = charts[0];

  const bias =
    analyses.length > 0
      ? `${Math.round(
          (analyses.filter((a) => a.direction === "LONG").length /
            analyses.length) *
            100
        )}% LONG`
      : "—";

  const avgConfidence =
    analyses.length > 0
      ? `${Math.round(
          analyses.reduce((sum, a) => sum + a.confidence, 0) /
            analyses.length
        )}%`
      : "—";

  const topStrategy = mode(analyses.map((a) => a.strategy)) ?? "—";

  return [
    { label: "Trades logged", value: String(charts.length) },
    { label: "This week", value: String(thisWeek) },
    { label: "Direction bias", value: bias },
    { label: "Avg. confidence", value: avgConfidence },
    { label: "Most common setup", value: topStrategy },
    { label: "Last activity", value: last ? timeAgo(last.created_at) : "—" },
  ];
}
