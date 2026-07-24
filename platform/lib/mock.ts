import type { MockAnalysis } from "@/lib/types";

/**
 * Placeholder analysis data -- there is no real chart-reading AI yet.
 * Fixed, not randomized, so it's obviously illustrative rather than
 * looking like a real (if oddly consistent) signal. The MOCK badge in
 * TradeCardMock.tsx is the actual honesty signal to the user; this is
 * just believable-looking filler shaped like the real TradeCard schema
 * will eventually be.
 */
export function generateMockAnalysis(): Omit<
  MockAnalysis,
  "id" | "chart_id" | "user_id" | "created_at"
> {
  return {
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
