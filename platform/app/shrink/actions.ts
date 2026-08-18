"use server";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getShrinkReply } from "@/lib/ai/shrinkChat";
import { generateMockShrinkReply } from "@/lib/mock";
import { AiNotConfiguredError } from "@/lib/ai/errors";
import type { ChartAnalysis, ShrinkMessage } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 2000;

// Once ANTHROPIC_API_KEY is live, every message is a real (paid) API call --
// same basic abuse/cost guard as the chart upload rate limit. Fails open:
// if the count query itself errors, sending is allowed rather than blocked.
const RATE_LIMIT_MAX_MESSAGES = 30;
const RATE_LIMIT_WINDOW_MINUTES = 60;

export type SendShrinkMessageResult =
  | { ok: true; reply: Pick<ShrinkMessage, "content" | "source" | "created_at"> }
  | { ok: false; error: string };

export async function sendShrinkMessage(
  message: string
): Promise<SendShrinkMessageResult> {
  const user = await requireUser();
  const trimmed = message.trim();

  if (!trimmed) {
    return { ok: false, error: "Message can't be empty." };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `That message is too long (max ${MAX_MESSAGE_LENGTH} characters).`,
    };
  }

  const supabase = await createClient();

  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  ).toISOString();
  const { count, error: countError } = await supabase
    .from("shrink_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("role", "user")
    .gte("created_at", windowStart);

  if (!countError && (count ?? 0) >= RATE_LIMIT_MAX_MESSAGES) {
    return {
      ok: false,
      error: `You've sent ${RATE_LIMIT_MAX_MESSAGES} messages in the last hour. Please wait a bit before sending more.`,
    };
  }

  const [{ data: recentAnalyses }, { data: recentMessages }] = await Promise.all([
    supabase
      .from("chart_analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15)
      .returns<ChartAnalysis[]>(),
    supabase
      .from("shrink_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<Pick<ShrinkMessage, "role" | "content">[]>(),
  ]);

  const { error: insertUserError } = await supabase
    .from("shrink_messages")
    .insert({ user_id: user.id, role: "user", content: trimmed });

  if (insertUserError) {
    return { ok: false, error: insertUserError.message };
  }

  let replyText: string;
  let source: "mock" | "claude";
  try {
    replyText = await getShrinkReply(
      trimmed,
      recentAnalyses ?? [],
      (recentMessages ?? []).slice().reverse()
    );
    source = "claude";
  } catch (err) {
    if (!(err instanceof AiNotConfiguredError)) {
      console.error("Shrink chat reply failed, falling back to mock:", err);
    }
    replyText = generateMockShrinkReply();
    source = "mock";
  }

  const { data: assistantRow, error: insertAssistantError } = await supabase
    .from("shrink_messages")
    .insert({
      user_id: user.id,
      role: "assistant",
      content: replyText,
      source,
    })
    .select("content, source, created_at")
    .single();

  if (insertAssistantError || !assistantRow) {
    // The user's message is saved either way; only the reply failed to
    // persist. Still return it so the conversation doesn't feel broken --
    // it just won't be there on next page load.
    return {
      ok: true,
      reply: {
        content: replyText,
        source,
        created_at: new Date().toISOString(),
      },
    };
  }

  return { ok: true, reply: assistantRow };
}
