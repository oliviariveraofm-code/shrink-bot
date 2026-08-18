import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getConfiguredApiKey } from "@/lib/ai/apiKey";
import type { ChartAnalysis, ShrinkMessage } from "@/lib/types";

const SYSTEM_PROMPT = `You are "The Shrink", the behavioral coach for The Trading Floor -- a calm, direct trading psychologist, not a hype man. You talk to one trader at a time about their own logged activity.

Ground everything you say in the data given to you below: their recent chart uploads and analyses. Discuss patterns you can actually see -- how often they upload, direction bias (long vs short), which setups/strategies repeat, confidence trends, timing. Keep replies short: 2-4 sentences, conversational, no bullet-point essays.

Be honest about the limits of what you know. This app does not yet track trade outcomes (wins, losses, P&L) -- only chart uploads and their analysis. If asked about win rate, profitability, or account performance, say plainly that outcome tracking isn't built yet, rather than guessing or inventing numbers.`;

function summarizeAnalyses(analyses: ChartAnalysis[]): string {
  if (analyses.length === 0) {
    return "This trader hasn't uploaded any charts yet.";
  }
  const lines = analyses.map((a) => {
    const when = new Date(a.created_at).toISOString();
    return `- ${when}: ${a.pair}, ${a.direction}, ${a.confidence}% confidence, strategy=${a.strategy}, killzone=${a.killzone}, flags=[${a.flags.join(", ")}]`;
  });
  return `Recent chart uploads (${analyses.length}, most recent first):\n${lines.join("\n")}`;
}

/**
 * Real Shrink chat reply via Claude, grounded in the trader's own recent
 * chart_analyses rows and prior conversation. Throws AiNotConfiguredError
 * if ANTHROPIC_API_KEY isn't set -- callers should catch that specifically
 * and fall back to lib/mock.ts's generateMockShrinkReply(), same
 * deferred-connection pattern as chart analysis.
 */
export async function getShrinkReply(
  userMessage: string,
  recentAnalyses: ChartAnalysis[],
  recentMessages: Pick<ShrinkMessage, "role" | "content">[]
): Promise<string> {
  const apiKey = getConfiguredApiKey();
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_ANALYSIS_MODEL || "claude-sonnet-5",
    max_tokens: 512,
    system: `${SYSTEM_PROMPT}\n\n${summarizeAnalyses(recentAnalyses)}`,
    messages: [
      ...recentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user" as const, content: userMessage },
    ],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );

  if (!textBlock) {
    throw new Error("Claude did not return a text reply for this message.");
  }

  return textBlock.text;
}
