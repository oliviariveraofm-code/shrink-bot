import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { radialTexture } from "./textures";

const NODE_COUNT = 46;

function buildNodes(count, radius) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Fibonacci sphere distribution — even coverage without clustering at poles.
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = Math.PI * (3 - Math.sqrt(5)) * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const jitter = radius * (0.85 + Math.random() * 0.3);
    positions.set([x * jitter, y * jitter, z * jitter], i * 3);
  }
  return positions;
}

function buildNetworkLines(positions, maxDist) {
  const count = positions.length / 3;
  const verts = [];
  for (let a = 0; a < count; a++) {
    for (let b = a + 1; b < count; b++) {
      const dx = positions[a * 3] - positions[b * 3];
      const dy = positions[a * 3 + 1] - positions[b * 3 + 1];
      const dz = positions[a * 3 + 2] - positions[b * 3 + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < maxDist) {
        verts.push(
          positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2],
          positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]
        );
      }
    }
  }
  return new Float32Array(verts);
}

// Heartbeat-shaped pulse: two sharp beats then a rest, looping — mirrors an ECG rhythm.
function heartbeatPulse(t) {
  const cycle = t % 1.6;
  const beat = (center, width) => Math.exp(-Math.pow((cycle - center) / width, 2));
  return beat(0.12, 0.05) * 1.0 + beat(0.3, 0.08) * 0.6;
}

export default function PsychCore({ complexShaders = true }) {
  const coreRef = useRef();
  const coreMatRef = useRef();
  const nodesRef = useRef();
  const groupRef = useRef();
  const particlesRef = useRef();

  const nodePositions = useMemo(() => buildNodes(NODE_COUNT, 2.4), []);
  const linePositions = useMemo(() => buildNetworkLines(nodePositions, 1.15), [nodePositions]);
  const dotTexture = useMemo(() => radialTexture("#7ee8d6", "psych-node"), []);
  const flowTexture = useMemo(() => radialTexture("#e8c774", "psych-flow"), []);

  const flowCount = complexShaders ? 90 : 40;
  const flowData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < flowCount; i++) {
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      arr.push({ dir, offset: Math.random(), speed: 0.15 + Math.random() * 0.2, startR: 6.5 + Math.random() * 2 });
    }
    return arr;
  }, [flowCount]);

  const flowPositions = useMemo(() => new Float32Array(flowCount * 3), [flowCount]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const pulse = heartbeatPulse(t);

    if (groupRef.current) groupRef.current.rotation.y += delta * 0.09;
    if (nodesRef.current) nodesRef.current.rotation.y -= delta * 0.03;

    if (coreRef.current) {
      const s = 1 + pulse * 0.22;
      coreRef.current.scale.setScalar(s);
    }
    if (coreMatRef.current) {
      coreMatRef.current.opacity = 0.55 + pulse * 0.45;
    }

    const positions = particlesRef.current?.geometry.attributes.position;
    if (positions) {
      for (let i = 0; i < flowCount; i++) {
        const f = flowData[i];
        f.offset -= delta * f.speed;
        if (f.offset <= 0) f.offset = 1;
        const r = f.startR * f.offset;
        const i3 = i * 3;
        flowPositions[i3] = f.dir.x * r;
        flowPositions[i3 + 1] = f.dir.y * r;
        flowPositions[i3 + 2] = f.dir.z * r;
      }
      positions.array = flowPositions;
      positions.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.85, 2]} />
        <meshBasicMaterial ref={coreMatRef} color="#e8c774" wireframe transparent opacity={0.8} />
      </mesh>
      <mesh scale={0.6}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshBasicMaterial color="#4fd1be" transparent opacity={0.35} />
      </mesh>

      <group ref={nodesRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.16} map={dotTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
        </points>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#4fd1be" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
        </lineSegments>
      </group>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[flowPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.22} map={flowTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation opacity={0.85} />
      </points>

      <pointLight color="#e8c774" intensity={3.5} distance={9} decay={2} />
    </group>
  );
}
