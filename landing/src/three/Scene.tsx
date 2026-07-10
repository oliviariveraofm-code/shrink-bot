import { Canvas } from "@react-three/fiber";
import type { RootState } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import HexLogo from "./HexLogo";
import ShrinkFaceGLTF from "./ShrinkFaceGLTF";
import AgentRing from "./AgentRing";
import ParticleField from "./ParticleField";
import CameraRig from "./CameraRig";
import PostFX from "./PostFX";
import SectionAmbient from "./SectionAmbient";
import FpsGuard from "./FpsGuard";
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
        <ShrinkFaceGLTF url="/models/shrink-head.glb" excludeNames={["Cube002"]} scale={1.05} />
        <AgentRing radius={6.2} alignBoost={alignBoost} />
      </RevealGroup>
    </group>
  );
}

const QUALITY_TIERS = [
  { dpr: 1.5, particleMult: 1 },
  { dpr: 1.15, particleMult: 0.75 },
  { dpr: 1, particleMult: 0.55 },
  { dpr: 0.75, particleMult: 0.4 },
] as const;

export default function Scene() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 820;
  const baseParticleCount = isMobile ? 3600 : 7000;
  const [tier, setTier] = useState(0);
  const [canvasKey, setCanvasKey] = useState(0);

  const quality = QUALITY_TIERS[tier];
  const particleCount = Math.round(baseParticleCount * quality.particleMult);

  const stepDown = useCallback(() => {
    setTier((t) => Math.min(t + 1, QUALITY_TIERS.length - 1));
  }, []);
  const stepUp = useCallback(() => {
    setTier((t) => Math.max(t - 1, 0));
  }, []);

  const handleCreated = useCallback(({ gl }: RootState) => {
    const canvas = gl.domElement;
    const onLost = (e: Event) => {
      e.preventDefault();
      console.warn("WebGL context lost — will reinitialize the scene once it's restored.");
    };
    const onRestored = () => {
      // cheapest reliable recovery: remount the whole Canvas so every
      // geometry/material/texture is recreated against the new context
      setCanvasKey((k) => k + 1);
    };
    canvas.addEventListener("webglcontextlost", onLost, false);
    canvas.addEventListener("webglcontextrestored", onRestored, false);
  }, []);

  const dpr = useMemo(() => quality.dpr, [quality]);

  return (
    <div className="canvas-root" aria-hidden="true">
      <Canvas
        key={canvasKey}
        dpr={dpr}
        gl={{ antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: false }}
        camera={{ fov: 50, near: 0.1, far: 200, position: [0, 0, 6.2] }}
        onCreated={handleCreated}
      >
        <color attach="background" args={["#0E0F13"]} />
        <fog attach="fog" args={["#0E0F13", 20, 70]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 8]} intensity={8} color="#C4A052" distance={30} />

        <FpsGuard onSlow={stepDown} onRecovered={stepUp} />

        <Suspense fallback={null}>
          <CameraRig />
          <ParticleField count={particleCount} worldHeight={TOTAL_WORLD_HEIGHT} radius={24} />

          <HeroGroup />

          <group position={[0, WORLD_Y.shrink, 0]}>
            <ShrinkFaceGLTF url="/models/shrink-head.glb" excludeNames={["Cube002"]} scale={1.15} breatheSeconds={4.5} />
            <SectionAmbient worldY={0} cullY={WORLD_Y.shrink} count={8} />
          </group>

          <group position={[0, WORLD_Y.sessions, 0]}>
            <SectionAmbient worldY={0} cullY={WORLD_Y.sessions} count={10} colorA="#C4A052" colorB="#4FD1BE" spread={11} />
          </group>

          <group position={[0, WORLD_Y.rules, 0]}>
            <SectionAmbient worldY={0} cullY={WORLD_Y.rules} count={8} colorA="#C4A052" colorB="#E0524E" spread={11} />
          </group>

          <group position={[0, WORLD_Y.pricing, 0]}>
            <SectionAmbient worldY={0} cullY={WORLD_Y.pricing} count={10} colorA="#C4A052" colorB="#4FD1BE" spread={11} />
          </group>

          <group position={[0, WORLD_Y.propfirms, 0]}>
            <SectionAmbient worldY={0} cullY={WORLD_Y.propfirms} count={8} colorA="#C4A052" colorB="#4FD1BE" spread={11} />
          </group>

          <group position={[0, WORLD_Y.footer, 0]}>
            <SectionAmbient worldY={0} cullY={WORLD_Y.footer} count={6} colorA="#C4A052" colorB="#4FD1BE" spread={9} />
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
