import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import PsychCore from "@/three/PsychCore";
import ECGLine from "./ECGLine";
import EnforcementTimer from "./EnforcementTimer";
import { useInView } from "@/hooks/useInView";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { BEHAVIOR_PATTERNS } from "@/data/propfirms";

export default function ShrinkSection() {
  const { ref, inView } = useInView();
  const { complexShaders, dpr } = useDeviceTier();

  return (
    <section id="shrink" ref={ref} className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="eyebrow text-[var(--color-red)]">Agent 05 — The Shrink</div>
          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
            Not a therapist. <span className="text-gradient-gold">A pattern recorder.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--color-ink-dim)] sm:text-base">
            The Shrink analyzes trader behavior data and returns cold, clinical observations. No
            sympathy, no encouragement, no punishment — just what the data shows.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {BEHAVIOR_PATTERNS.map((p) => (
              <span
                key={p}
                className="rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/5 px-3 py-1 text-[0.68rem] tracking-wide text-[var(--color-red)]"
              >
                {p}
              </span>
            ))}
          </div>

          <div className="mt-10">
            <div className="mb-2 flex items-center gap-2 text-[0.65rem] uppercase tracking-widest text-[var(--color-ink-faint)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal)]" />
              Behavioral trace, live session
            </div>
            <ECGLine className="h-24 w-full max-w-md" />
          </div>

          <blockquote className="mt-8 border-l-2 border-[var(--color-gold)]/40 pl-4 text-sm italic text-[var(--color-ink-dim)]">
            "The data is not concerned with how you feel about it."
          </blockquote>
        </div>

        <div className="relative">
          <div className="relative mx-auto h-[380px] w-full max-w-md">
            {inView && (
              <Canvas dpr={dpr} camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                <Suspense fallback={null}>
                  <PsychCore complexShaders={complexShaders} />
                </Suspense>
              </Canvas>
            )}
          </div>

          <div className="mt-4">
            <EnforcementTimer />
          </div>
        </div>
      </div>
    </section>
  );
}
