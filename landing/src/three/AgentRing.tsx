import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { AGENTS } from "../data/agents";

const AGENT_TEXTURE_URLS = AGENTS.map((a) => `/agents/${a.id}.png`);

interface AgentDatum {
  color: THREE.Color;
  orbitRadius: number;
  orbitPeriod: number;
  orbitOffset: number;
  bobPeriod: number;
  bobOffset: number;
  bobAmp: number;
}

interface Props {
  radius?: number;
  visible?: boolean;
  opacity?: number;
  alignBoost?: React.MutableRefObject<number>;
}

export default function AgentRing({ radius = 6.2, opacity = 1, alignBoost }: Props) {
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const glowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const streamRef = useRef<THREE.Points>(null);
  const textures = useTexture(AGENT_TEXTURE_URLS);

  const data: AgentDatum[] = useMemo(
    () =>
      AGENTS.map((a, i) => ({
        color: new THREE.Color(a.color),
        orbitRadius: radius + (i % 3) * 0.55 - 0.55,
        orbitPeriod: 15 + Math.random() * 15,
        orbitOffset: (i / AGENTS.length) * Math.PI * 2,
        bobPeriod: 2 + Math.random() * 2,
        bobOffset: Math.random() * Math.PI * 2,
        bobAmp: 0.35 + Math.random() * 0.25,
      })),
    [radius]
  );

  const streamsPerAgent = 5;
  const streamGeo = useMemo(() => {
    const total = AGENTS.length * streamsPerAgent;
    const positions = new Float32Array(total * 3);
    const colors = new Float32Array(total * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  const agentPos = useMemo(() => AGENTS.map(() => new THREE.Vector3()), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    let alignSum = 0;

    data.forEach((d, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      const angle = d.orbitOffset + (t * Math.PI * 2) / d.orbitPeriod;
      const x = Math.cos(angle) * d.orbitRadius;
      const z = Math.sin(angle) * d.orbitRadius;
      const y = Math.sin(t * (Math.PI * 2) / d.bobPeriod + d.bobOffset) * d.bobAmp;
      g.position.set(x, y, z);
      g.lookAt(0, 0, 0);
      agentPos[i].set(x, y, z);

      const glow = glowRefs.current[i];
      if (glow) {
        const mat = glow.material as THREE.MeshBasicMaterial;
        const pulse = 0.85 + Math.sin(t * 3 + d.bobOffset) * 0.15;
        mat.opacity = opacity * pulse;
      }
      alignSum += Math.cos(angle) * 0.5 + 0.5;
    });

    if (alignBoost) {
      const norm = alignSum / data.length;
      const spike = norm > 0.78 ? (norm - 0.78) / 0.22 : 0;
      alignBoost.current += (spike - alignBoost.current) * 0.05;
    }

    const posAttr = streamGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = streamGeo.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    data.forEach((d, i) => {
      for (let k = 0; k < streamsPerAgent; k++) {
        const speed = 0.35;
        const localT = (t * speed + k / streamsPerAgent + i * 0.07) % 1;
        const idx = (i * streamsPerAgent + k) * 3;
        const p = agentPos[i];
        posArr[idx] = p.x * (1 - localT);
        posArr[idx + 1] = p.y * (1 - localT);
        posArr[idx + 2] = p.z * (1 - localT);
        const fade = Math.sin(localT * Math.PI);
        colArr[idx] = d.color.r * fade;
        colArr[idx + 1] = d.color.g * fade;
        colArr[idx + 2] = d.color.b * fade;
      }
    });
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <group>
      {data.map((d, i) => (
        <group key={AGENTS[i].id} ref={(el) => { groupRefs.current[i] = el; }}>
          <mesh ref={(el) => { glowRefs.current[i] = el; }}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshBasicMaterial color={d.color} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <sprite scale={[0.3, 0.3, 1]}>
            <spriteMaterial map={textures[i]} transparent depthWrite={false} toneMapped={false} />
          </sprite>
        </group>
      ))}
      <points ref={streamRef} geometry={streamGeo}>
        <pointsMaterial size={0.05} vertexColors transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation toneMapped={false} />
      </points>
    </group>
  );
}
