"use client";

import { useRef, useState } from "react";
import { sendShrinkMessage } from "@/app/shrink/actions";
import type { ShrinkMessage } from "@/lib/types";

type DisplayMessage = Pick<
  ShrinkMessage,
  "role" | "content" | "source" | "created_at"
>;

export default function ShrinkChat({
  initialMessages,
}: {
  initialMessages: DisplayMessage[];
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setError(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmed,
        source: null,
        created_at: new Date().toISOString(),
      },
    ]);
    scrollToBottom();
    setIsSending(true);

    try {
      const result = await sendShrinkMessage(trimmed);
      if (!result.ok) {
        setError(result.error);
        // Nothing was persisted server-side for a validation/rate-limit
        // failure -- drop the optimistic bubble so the UI matches reality.
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.reply.content,
          source: result.reply.source,
          created_at: result.reply.created_at,
        },
      ]);
      scrollToBottom();
    } catch {
      setError("Message failed to send. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="panel shrink-chat">
      <div className="panel__label">Talk to The Shrink</div>

      <div className="shrink-chat__messages" ref={listRef}>
        {messages.length === 0 ? (
          <div className="shrink-chat__empty">
            Ask about your upload patterns, direction bias, or repeated
            setups -- The Shrink reads your logged chart activity below to
            answer.
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`shrink-msg shrink-msg--${m.role}`}
            >
              <div className="shrink-msg__bubble">{m.content}</div>
              {m.role === "assistant" && m.source ? (
                <span className={`shrink-msg__source shrink-msg__source--${m.source}`}>
                  {m.source === "mock" ? "MOCK REPLY" : "THE SHRINK — LIVE"}
                </span>
              ) : null}
            </div>
          ))
        )}
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <form className="shrink-chat__form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask The Shrink about your trading behavior…"
          disabled={isSending}
          maxLength={2000}
          aria-label="Message to The Shrink"
        />
        <button
          className="btn btn--primary"
          type="submit"
          disabled={isSending || !input.trim()}
        >
          {isSending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
