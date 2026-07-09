import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Timeline3D from "@/three/Timeline3D";
import { useInView } from "@/hooks/useInView";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { SESSIONS } from "@/data/sessions";

export default function SessionsSection() {
  const { ref, inView } = useInView();
  const { complexShaders, dpr } = useDeviceTier();
  const progressRef = useScrollProgress(ref);
  const [active, setActive] = useState(null);

  return (
    <section id="sessions" ref={ref} className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="eyebrow">Session Map</div>
          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
            The clock is <span className="text-gradient-gold">part of the edge.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--color-ink-dim)] sm:text-base">
            Twenty-four hours, mapped. Prime windows glow. Dead zones don't get sized into, no matter
            how good the setup looks.
          </p>
        </div>

        <div className="relative mt-14 h-[420px] sm:h-[480px]">
          {inView && (
            <Canvas dpr={dpr} camera={{ position: [0, 0.3, 12], fov: 50 }} gl={{ antialias: true, alpha: true }}>
              <Suspense fallback={null}>
                <Timeline3D progressRef={progressRef} complexShaders={complexShaders} />
              </Suspense>
            </Canvas>
          )}
        </div>

        <div className="mx-auto mt-6 flex max-w-lg items-center justify-center gap-6 text-[0.68rem] uppercase tracking-wider text-[var(--color-ink-faint)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-gold)]" /> Prime window
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-teal)]" /> Secondary
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-ink-faint)]" /> Dead zone
          </span>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {SESSIONS.map((s) => (
            <button
              key={s.id}
              onMouseEnter={() => setActive(s.id)}
              onMouseLeave={() => setActive(null)}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-left transition-colors hover:border-[var(--color-gold)]/40"
            >
              <div className="text-[0.62rem] font-mono-num text-[var(--color-ink-faint)]">
                {String(s.start).padStart(2, "0")}:00–{String(s.end).padStart(2, "0")}:00
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--color-ink)]">{s.label}</div>
              <div
                className={`mt-2 grid overflow-hidden text-[0.68rem] leading-snug text-[var(--color-ink-dim)] transition-[grid-template-rows,opacity] duration-300 ${
                  active === s.id ? "opacity-100" : "opacity-0"
                }`}
                style={{ gridTemplateRows: active === s.id ? "1fr" : "0fr" }}
              >
                <div className="min-h-0">{s.note}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
