import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction, ChromaticAberrationEffect, VignetteEffect } from "postprocessing";
import * as THREE from "three";
import { fxState } from "../lib/fxState";

export default function PostFX() {
  const chromaRef = useRef<ChromaticAberrationEffect>(null);
  const vignetteRef = useRef<VignetteEffect>(null);

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
      <ChromaticAberration ref={chromaRef} offset={new THREE.Vector2(0.0004, 0.0002)} blendFunction={BlendFunction.NORMAL} radialModulation={false} modulationOffset={0} />
      <Vignette ref={vignetteRef} eskil={false} offset={0.25} darkness={0.9} blendFunction={BlendFunction.NORMAL} />
      <Noise premultiply opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
