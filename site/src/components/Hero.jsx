import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, Vignette as PPVignette } from "@react-three/postprocessing";
import Galaxy from "@/three/Galaxy";
import HexLogo from "@/three/HexLogo";
import CameraRig from "@/three/CameraRig";
import LensFlare from "@/three/LensFlare";
import TradeCard from "./TradeCard";
import Typewriter from "./Typewriter";
import MagneticButton from "./MagneticButton";
import { useDeviceTier } from "@/hooks/useDeviceTier";

export default function Hero() {
  const { particleCount, complexShaders, dpr } = useDeviceTier();
  const sectionRef = useRef(null);

  return (
    <section id="hero" ref={sectionRef} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Canvas
          dpr={dpr}
          camera={{ position: [0, 4, 30], fov: 55, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#0e0f13"]} />
          <fog attach="fog" args={["#0e0f13", 22, 62]} />
          <ambientLight intensity={0.3} />
          <Suspense fallback={null}>
            <Galaxy count={particleCount} complexShaders={complexShaders} />
            <HexLogo position={[10, 5.5, -6]} />
            <LensFlare position={[-10, 8, -30]} />
          </Suspense>
          <CameraRig />
          {complexShaders && (
            <EffectComposer multisampling={0}>
              <DepthOfField focusDistance={0.012} focalLength={0.04} bokehScale={2.4} height={480} />
              <Bloom luminanceThreshold={0.22} luminanceSmoothing={0.9} intensity={0.55} mipmapBlur />
              <PPVignette eskil={false} offset={0.15} darkness={0.9} />
            </EffectComposer>
          )}
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 pt-20 text-center sm:pt-0">
        <div className="eyebrow mb-5 animate-float">The Trading Floor — Consensus Engine</div>

        <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.12] tracking-tight text-[var(--color-ink)] sm:text-5xl md:text-6xl">
          <Typewriter text="Twelve agents. One analysis." />
          <br />
          <span className="text-gradient-gold">
            <Typewriter text="No call without consensus." startDelay={1500} />
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-sm text-[var(--color-ink-dim)] sm:text-base">
          A multi-agent trading floor that argues with itself before it argues with the market —
          then a fifth voice audits how you handled the answer.
        </p>

        <div className="pointer-events-auto mt-9 flex flex-col items-center gap-4 sm:flex-row">
          <MagneticButton href="#join" variant="gold">
            Join Discord
          </MagneticButton>
          <MagneticButton href="#agents" variant="ghost">
            Read Briefing
          </MagneticButton>
        </div>

        <div className="pointer-events-auto mt-10 scale-90 sm:mt-12 sm:scale-100">
          <TradeCard />
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <div className="mx-auto h-9 w-5 rounded-full border border-white/20">
          <div className="mx-auto mt-1.5 h-1.5 w-1 animate-bounce rounded-full bg-[var(--color-gold)]" />
        </div>
      </div>
    </section>
  );
}
