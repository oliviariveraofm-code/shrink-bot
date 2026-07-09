import { forwardRef, useState } from "react";
import AgentGlyph from "@/icons/AgentGlyph";

const FLOAT_VARIANTS = [
  { duration: "6.2s", delay: "0s", drift: "10px" },
  { duration: "7.4s", delay: "-1.4s", drift: "14px" },
  { duration: "5.6s", delay: "-2.6s", drift: "8px" },
  { duration: "8.1s", delay: "-0.6s", drift: "16px" },
];

const AgentCard = forwardRef(function AgentCard({ agent, depth, index }, ref) {
  const [hovered, setHovered] = useState(false);
  const float = FLOAT_VARIANTS[index % FLOAT_VARIANTS.length];

  return (
    <div
      ref={ref}
      className="agent-card-slot [transform-style:preserve-3d]"
      style={{
        "--float-duration": float.duration,
        "--float-delay": float.delay,
        "--float-drift": float.drift,
        "--rest-z": `${depth}px`,
        transform: `translateZ(${depth}px)`,
      }}
    >
      <div
        className="agent-card-float"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="group relative h-full w-full rounded-2xl border p-5 transition-[transform,box-shadow,border-color] duration-300 ease-out [transform-style:preserve-3d]"
          style={{
            transform: hovered ? "translateZ(70px) rotateY(15deg) rotateX(-4deg) scale(1.04)" : "translateZ(0px)",
            borderColor: hovered ? agent.color : "rgba(255,255,255,0.08)",
            background: "linear-gradient(155deg, rgba(25,27,34,0.9), rgba(14,15,19,0.94))",
            boxShadow: hovered
              ? `0 25px 60px -20px ${agent.color}66, 0 0 0 1px ${agent.color}33 inset`
              : "0 10px 30px -18px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex items-start justify-between">
            <span className="font-mono-num text-[0.65rem] tracking-widest text-[var(--color-ink-faint)]">
              {agent.n}
            </span>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full border transition-transform duration-300"
              style={{
                borderColor: `${agent.color}55`,
                color: agent.color,
                transform: hovered ? "scale(1.18)" : "scale(1)",
              }}
            >
              <AgentGlyph id={agent.id} className={`h-4.5 w-4.5 ${hovered ? "animate-pulse" : ""}`} />
            </div>
          </div>

          <h3 className="mt-4 font-display text-base font-semibold text-[var(--color-ink)]">{agent.name}</h3>
          <div className="mt-0.5 text-[0.68rem] uppercase tracking-wider" style={{ color: agent.color }}>
            {agent.role}
          </div>

          <p className="mt-3 text-[0.78rem] leading-snug text-[var(--color-ink-dim)]">{agent.summary}</p>

          <div
            className="mt-4 grid gap-2 overflow-hidden text-[0.72rem] leading-snug text-[var(--color-ink-dim)] transition-[grid-template-rows,opacity] duration-300"
            style={{
              gridTemplateRows: hovered ? "1fr" : "0fr",
              opacity: hovered ? 1 : 0,
            }}
          >
            <div className="min-h-0">
              <div className="divider-line mb-2" />
              {agent.detail}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {agent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-2 py-0.5 text-[0.6rem] tracking-wide"
                    style={{ borderColor: `${agent.color}44`, color: agent.color }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AgentCard;
