import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { radialTexture } from "./textures";

// Lightweight lens-flare stand-in: a bright core sprite plus a few smaller
// echo sprites along the vector toward screen center, all additive-blended.
export default function LensFlare({ position = [-10, 8, -30] }) {
  const coreTex = useMemo(() => radialTexture("#fff4d6", "flare-core"), []);
  const goldTex = useMemo(() => radialTexture("#c4a052", "flare-gold"), []);
  const tealTex = useMemo(() => radialTexture("#4fd1be", "flare-teal"), []);
  const group = useRef();

  useFrame((state) => {
    if (group.current) {
      const t = state.clock.elapsedTime;
      group.current.children.forEach((child, i) => {
        if (!child.material) return;
        const flicker = 0.85 + Math.sin(t * 1.4 + i) * 0.15;
        child.material.opacity = child.userData.baseOpacity * flicker;
      });
    }
  });

  const sprites = [
    { tex: coreTex, pos: [0, 0, 0], scale: 5, opacity: 0.9 },
    { tex: goldTex, pos: [-3, -2.4, 2], scale: 2.2, opacity: 0.35 },
    { tex: tealTex, pos: [-6, -4.8, 4], scale: 1.4, opacity: 0.25 },
    { tex: goldTex, pos: [-9, -7.2, 6], scale: 0.9, opacity: 0.18 },
  ];

  return (
    <group ref={group} position={position}>
      {sprites.map((s, i) => (
        <sprite
          key={i}
          position={s.pos}
          scale={[s.scale, s.scale, 1]}
          userData={{ baseOpacity: s.opacity }}
        >
          <spriteMaterial
            map={s.tex}
            transparent
            opacity={s.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
      <pointLight color="#f5e6c0" intensity={2} distance={40} decay={2} />
    </group>
  );
}
