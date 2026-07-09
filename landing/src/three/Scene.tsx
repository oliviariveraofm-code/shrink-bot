import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import HexLogo from "./HexLogo";
import ShrinkBrain from "./ShrinkBrain";
import AgentRing from "./AgentRing";
import ParticleField from "./ParticleField";
import CameraRig from "./CameraRig";
import PostFX from "./PostFX";
import SectionAmbient from "./SectionAmbient";
import { subscribeIntro, getIntroPhase } from "../lib/introState";
import { TOTAL_WORLD_HEIGHT, WORLD_Y } from "../lib/worldLayout";
import { getScrollState } from "../lib/scrollStore";

function RevealGroup({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState(getIntroPhase());
  useEffect(() => subscribeIntro(() => setPhase(getIntroPhase())), []);

  return <group visible={phase !== "logo"}>{children}</group>;
}

function HeroGroup() {
  const alignBoost = useRef(0);
  return (
    <group position={[0, WORLD_Y.hero, 0]}>
      <HexLogo delaySeconds={2} />
      <RevealGroup>
        <ShrinkBrain scale={1.05} ySpinSeconds={9} xTiltSeconds={11} alignBoost={alignBoost} />
        <AgentRing radius={6.2} alignBoost={alignBoost} />
      </RevealGroup>
    </group>
  );
}

export default function Scene() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 820;
  const particleCount = isMobile ? 4500 : 9000;
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio || 1, 1.75));

  return (
    <div className="canvas-root" aria-hidden="true">
      <Canvas
        dpr={dpr}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 50, near: 0.1, far: 200, position: [0, 0, 6.2] }}
      >
        <color attach="background" args={["#0E0F13"]} />
        <fog attach="fog" args={["#0E0F13", 20, 70]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 8]} intensity={8} color="#C4A052" distance={30} />

        <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(d - 0.35, 0.75))} />
        <AdaptiveDpr pixelated />

        <Suspense fallback={null}>
          <CameraRig />
          <ParticleField count={particleCount} worldHeight={TOTAL_WORLD_HEIGHT} radius={24} />

          <HeroGroup />

          <group position={[0, WORLD_Y.shrink, 0]}>
            <ShrinkBrain scale={1.5} ySpinSeconds={20} xTiltSeconds={8} breatheSeconds={4.5} heartbeatSeconds={1.7} />
            <SectionAmbient worldY={0} count={8} />
          </group>

          <group position={[0, WORLD_Y.sessions, 0]}>
            <SectionAmbient worldY={0} count={10} colorA="#C4A052" colorB="#4FD1BE" spread={11} />
          </group>

          <group position={[0, WORLD_Y.rules, 0]}>
            <SectionAmbient worldY={0} count={8} colorA="#C4A052" colorB="#E0524E" spread={11} />
          </group>

          <group position={[0, WORLD_Y.pricing, 0]}>
            <SectionAmbient worldY={0} count={10} colorA="#C4A052" colorB="#4FD1BE" spread={11} />
          </group>

          <group position={[0, WORLD_Y.propfirms, 0]}>
            <SectionAmbient worldY={0} count={8} colorA="#C4A052" colorB="#4FD1BE" spread={11} />
          </group>

          <group position={[0, WORLD_Y.footer, 0]}>
            <SectionAmbient worldY={0} count={6} colorA="#C4A052" colorB="#4FD1BE" spread={9} />
          </group>

          <PostFX />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function useScrollWorldProgress() {
  return getScrollState().progress;
}
