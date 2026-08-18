import "server-only";
import { AiNotConfiguredError } from "@/lib/ai/errors";

function isPlaceholderKey(key: string) {
  return (
    key.trim() === "" ||
    key.includes("YOUR_") ||
    key.includes("placeholder") ||
    key === "sk-ant-..."
  );
}

/**
 * Shared by every real-AI feature (chart analysis, Shrink chat). Throws
 * AiNotConfiguredError if ANTHROPIC_API_KEY isn't set or is still the
 * placeholder from .env.local.example -- callers should catch that
 * specifically and fall back to lib/mock.ts, same deferred-connection
 * pattern as Supabase/Vercel elsewhere in this app.
 */
export function getConfiguredApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || isPlaceholderKey(apiKey)) {
    throw new AiNotConfiguredError();
  }
  return apiKey;
}
