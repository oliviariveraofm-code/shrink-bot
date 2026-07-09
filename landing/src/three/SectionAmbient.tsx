import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  worldY: number;
  count?: number;
  colorA?: string;
  colorB?: string;
  spread?: number;
}

export default function SectionAmbient({ worldY, count = 10, colorA = "#C4A052", colorB = "#4FD1BE", spread = 9 }: Props) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * spread * 2,
        z: -4 - Math.random() * 6,
        y0: (Math.random() - 0.5) * 6,
        period: 3 + Math.random() * 3,
        offset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? colorA : colorB,
        scale: 0.06 + Math.random() * 0.12,
      })),
    [count, spread, colorA, colorB]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    data.forEach((d, i) => {
      const m = refs.current[i];
      if (!m) return;
      m.position.set(d.x + Math.sin(t * 0.15 + d.offset) * 0.6, worldY + d.y0 + Math.sin((t * Math.PI * 2) / d.period + d.offset) * 0.5, d.z);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(t * 0.8 + d.offset) * 0.25;
    });
  });

  return (
    <group>
      {data.map((d, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} scale={d.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={d.color} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
