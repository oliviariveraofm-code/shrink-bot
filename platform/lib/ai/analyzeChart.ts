import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { AiNotConfiguredError } from "@/lib/ai/errors";
import {
  AnalysisResultSchema,
  ANALYSIS_TOOL_INPUT_SCHEMA,
  type AnalysisResult,
} from "@/lib/ai/schema";

const SYSTEM_PROMPT = `You are analyzing a trading chart screenshot for "The Trading Floor", a service that reads charts the way a panel of specialized desks would -- structure, liquidity, timing, macro, order flow -- and only issues a call on consensus.

Read the attached chart image. Identify the asset and timeframe if visible, the likely direction, key levels (entry, stop-loss, two take-profits), and produce the analysis via the record_trade_analysis tool. Be concrete and specific to what's actually visible in the chart -- price levels, visible structure, trend direction -- rather than generic placeholder-sounding text. If the image is not a trading chart at all, still call the tool, but set confidence to 0 and explain that in the note field.`;

const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function isPlaceholderKey(key: string) {
  return (
    key.trim() === "" ||
    key.includes("YOUR_") ||
    key.includes("placeholder") ||
    key === "sk-ant-..."
  );
}

/**
 * Real chart analysis via Claude's vision + tool use. Throws
 * AiNotConfiguredError if ANTHROPIC_API_KEY isn't set (or is still the
 * placeholder from .env.local.example) -- callers should catch that
 * specifically and fall back to lib/mock.ts's generateMockAnalysis(),
 * same deferred-connection pattern as Supabase/Vercel elsewhere in this
 * app. Any other error (network, rate limit, bad model output) should
 * also be caught by the caller and treated the same way -- analysis
 * failures must never block the upload itself.
 */
export async function analyzeChart(
  imageBytes: Uint8Array,
  mimeType: string
): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || isPlaceholderKey(apiKey)) {
    throw new AiNotConfiguredError();
  }

  if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
    throw new Error(`Unsupported image type for analysis: ${mimeType}`);
  }

  const client = new Anthropic({ apiKey });
  const base64 = Buffer.from(imageBytes).toString("base64");

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_ANALYSIS_MODEL || "claude-sonnet-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: "record_trade_analysis",
        description: "Records the structured trade analysis for this chart.",
        input_schema: ANALYSIS_TOOL_INPUT_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "record_trade_analysis" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as
                | "image/jpeg"
                | "image/png"
                | "image/gif"
                | "image/webp",
              data: base64,
            },
          },
          {
            type: "text",
            text: "Analyze this chart and call record_trade_analysis.",
          },
        ],
      },
    ],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Claude did not return a tool_use block for this chart.");
  }

  return AnalysisResultSchema.parse(toolUse.input);
}
