import * as z from "zod";

/**
 * Shape of one analysis result, independent of whether it came from the
 * mock generator or real AI. Kept separate from the DB row type
 * (ChartAnalysis in lib/types.ts) so it can be validated on its own
 * before anything touches the database.
 */
export const AnalysisResultSchema = z.object({
  pair: z.string(),
  direction: z.enum(["LONG", "SHORT"]),
  confidence: z.number().int().min(0).max(100),
  entry: z.string(),
  entry_note: z.string(),
  sl: z.string(),
  sl_note: z.string(),
  tp1: z.string(),
  tp1_rr: z.string(),
  tp2: z.string(),
  tp2_rr: z.string(),
  note: z.string(),
  size: z.string(),
  valid_until: z.string(),
  strategy: z.string(),
  killzone: z.string(),
  consensus: z.string(),
  flags: z.array(z.string()).max(3),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

/**
 * Hand-written JSON Schema mirror of AnalysisResultSchema above, passed
 * as the Claude tool's input_schema to force structured output. Keep
 * these two in sync if the shape ever changes.
 */
export const ANALYSIS_TOOL_INPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    pair: {
      type: "string",
      description: "Asset and timeframe, e.g. 'XAUUSD 15M'.",
    },
    direction: { type: "string", enum: ["LONG", "SHORT"] },
    confidence: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "Consensus confidence percentage.",
    },
    entry: { type: "string", description: "Entry price." },
    entry_note: { type: "string", description: "What the entry level is, briefly." },
    sl: { type: "string", description: "Stop-loss price." },
    sl_note: { type: "string", description: "What invalidates the setup." },
    tp1: { type: "string" },
    tp1_rr: { type: "string", description: "Risk:reward at TP1, e.g. '1:2.1'." },
    tp2: { type: "string" },
    tp2_rr: { type: "string", description: "Risk:reward at TP2." },
    note: { type: "string", description: "One-line management note." },
    size: { type: "string", description: "Suggested position size as a percentage." },
    valid_until: { type: "string", description: "Expiry time for the setup." },
    strategy: { type: "string" },
    killzone: { type: "string", description: "Session/killzone quality." },
    consensus: { type: "string", description: "e.g. '6/8 BULL'." },
    flags: {
      type: "array",
      items: { type: "string" },
      maxItems: 3,
      description: "Up to 3 short condition flags.",
    },
  },
  required: [
    "pair",
    "direction",
    "confidence",
    "entry",
    "entry_note",
    "sl",
    "sl_note",
    "tp1",
    "tp1_rr",
    "tp2",
    "tp2_rr",
    "note",
    "size",
    "valid_until",
    "strategy",
    "killzone",
    "consensus",
    "flags",
  ],
};
