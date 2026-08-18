import type { ChartAnalysis } from "@/lib/types";

/**
 * Placeholder analysis data -- used whenever real AI analysis isn't
 * configured (no ANTHROPIC_API_KEY) or fails at runtime. Fixed, not
 * randomized, so it's obviously illustrative rather than looking like a
 * real (if oddly consistent) signal. The MOCK badge in TradeCard.tsx is
 * the actual honesty signal to the user, driven by `source: "mock"`.
 */
export function generateMockAnalysis(): Omit<
  ChartAnalysis,
  "id" | "chart_id" | "user_id" | "created_at"
> {
  return {
    source: "mock",
    pair: "XAUUSD 15M — LONG",
    direction: "LONG",
    confidence: 78,
    entry: "2318.50",
    entry_note: "Bull OB retest",
    sl: "2311.00",
    sl_note: "Invalidates OB",
    tp1: "2334.00",
    tp1_rr: "1:2.1",
    tp2: "2348.00",
    tp2_rr: "1:3.8",
    note: "At TP1: close 50%, move SL to break-even.",
    size: "1.5%",
    valid_until: "16:45 DUBAI",
    strategy: "STRATEGY C",
    killzone: "KILLZONE STRONG",
    consensus: "6/8 BULL",
    flags: ["OB+FVG STACK 🔒", "CORREL ✅", "OVERLAP CONT 🔄"],
  };
}

/**
 * Placeholder Shrink chat reply -- used whenever real AI chat isn't
 * configured (no ANTHROPIC_API_KEY) or fails at runtime. Fixed, not
 * randomized, same reasoning as generateMockAnalysis() above. The
 * "MOCK ANALYSIS" badge in ShrinkChat.tsx is the actual honesty signal,
 * driven by `source: "mock"`.
 */
export function generateMockShrinkReply(): string {
  return (
    "I'm running in placeholder mode right now -- real behavioral " +
    "analysis needs ANTHROPIC_API_KEY configured. Once that's live, " +
    "I'll read your actual logged charts and analyses (upload " +
    "frequency, direction bias, repeated setups) and talk through " +
    "what they say about your trading behavior."
  );
}
