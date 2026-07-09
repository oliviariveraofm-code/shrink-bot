import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction, ChromaticAberrationEffect, VignetteEffect } from "postprocessing";
import * as THREE from "three";
import { fxState } from "../lib/fxState";

export default function PostFX() {
  const chromaRef = useRef<ChromaticAberrationEffect | null>(null);
  const vignetteRef = useRef<VignetteEffect | null>(null);

  // @react-three/postprocessing's Bloom/ChromaticAberration/Vignette/Noise
  // wrappers are plain (non-forwardRef) function components. Under React 19,
  // `ref` now flows through as an ordinary prop, and this library feeds all
  // remaining props into JSON.stringify() as a useMemo dependency key — an
  // object *ref* (with .current pointing at a THREE.js instance full of
  // circular parent/child references) blows that up. A *callback* ref is
  // a plain function, which JSON.stringify silently skips instead of
  // trying to serialize, so this dodges the crash. Memoized so the
  // callback identity is stable across renders.
  const setChromaRef = useCallback((instance: ChromaticAberrationEffect | null) => {
    chromaRef.current = instance;
  }, []);
  const setVignetteRef = useCallback((instance: VignetteEffect | null) => {
    vignetteRef.current = instance;
  }, []);

  // stable identity across renders — a fresh object here would also get
  // JSON.stringify'd as part of that same memo dependency key
  const chromaOffset = useMemo(() => new THREE.Vector2(0.0004, 0.0002), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (chromaRef.current) {
      const pulse = Math.sin(t * 0.5) * 0.00012;
      chromaRef.current.offset.set(fxState.chromaOffset + pulse, fxState.chromaOffset * 0.6);
    }
    if (vignetteRef.current) {
      const breathe = Math.sin(t * (Math.PI * 2) / 5) * 0.04;
      vignetteRef.current.darkness = 0.9 * fxState.vignetteDarkness + breathe;
    }
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.6} luminanceThreshold={0.4} luminanceSmoothing={0.2} mipmapBlur={false} radius={0.35} />
      <ChromaticAberration ref={setChromaRef} offset={chromaOffset} blendFunction={BlendFunction.NORMAL} radialModulation={false} modulationOffset={0} />
      <Vignette ref={setVignetteRef} eskil={false} offset={0.25} darkness={0.9} blendFunction={BlendFunction.NORMAL} />
      <Noise premultiply opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
