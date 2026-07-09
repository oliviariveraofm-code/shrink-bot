import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { radialTexture } from "./textures";

const GOLD = new THREE.Color("#e8c774");
const TEAL = new THREE.Color("#4fd1be");
const DEEP = new THREE.Color("#2a2440");

function buildGalaxy(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const radius = 26;
  const branches = 5;
  const spin = 1.1;
  const randomness = 0.55;
  const randomnessPower = 2.6;

  const tmp = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.pow(Math.random(), 1.4) * radius;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;
    const spinAngle = r * spin;

    const rndX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
    const rndY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r * 0.3;
    const rndZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

    positions[i3] = Math.cos(branchAngle + spinAngle) * r + rndX;
    positions[i3 + 1] = rndY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rndZ;

    const mixT = r / radius;
    // Mostly gold-to-teal gradient with an occasional deep violet outlier for nebula variance.
    if (Math.random() < 0.08) {
      tmp.copy(DEEP);
    } else {
      tmp.copy(GOLD).lerp(TEAL, mixT);
    }
    colors[i3] = tmp.r;
    colors[i3 + 1] = tmp.g;
    colors[i3 + 2] = tmp.b;

    sizes[i] = Math.random() * 1.6 + 0.4;
  }

  return { positions, colors, sizes };
}

function pickConstellationPairs(positions, sampleCount, maxDist) {
  const total = positions.length / 3;
  const step = Math.max(1, Math.floor(total / sampleCount));
  const indices = [];
  for (let i = 0; i < total; i += step) indices.push(i);

  const linePositions = [];
  for (let a = 0; a < indices.length; a++) {
    const ia = indices[a] * 3;
    const ax = positions[ia],
      ay = positions[ia + 1],
      az = positions[ia + 2];
    let bestB = -1;
    let bestD = maxDist;
    for (let b = a + 1; b < indices.length; b++) {
      const ib = indices[b] * 3;
      const dx = ax - positions[ib];
      const dy = ay - positions[ib + 1];
      const dz = az - positions[ib + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < bestD) {
        bestD = d;
        bestB = b;
      }
    }
    if (bestB !== -1) {
      const ib = indices[bestB] * 3;
      linePositions.push(ax, ay, az, positions[ib], positions[ib + 1], positions[ib + 2]);
    }
  }
  return new Float32Array(linePositions);
}

export default function Galaxy({ count = 20000, complexShaders = true }) {
  const pointsRef = useRef();
  const groupRef = useRef();
  const dotTexture = useMemo(() => radialTexture("#f5e6c0", "star"), []);

  const { positions, colors } = useMemo(() => buildGalaxy(count), [count]);

  const linePositions = useMemo(() => {
    if (!complexShaders) return null;
    return pickConstellationPairs(positions, 170, 3.4);
  }, [positions, complexShaders]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.012;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= delta * 0.004;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.35, 0, 0.12]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={complexShaders ? 0.34 : 0.42}
          map={dotTexture}
          vertexColors
          transparent
          depthWrite={false}
          alphaTest={0.001}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {linePositions && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#4fd1be" transparent opacity={0.14} blending={THREE.AdditiveBlending} />
        </lineSegments>
      )}

      <NebulaVolumes complexShaders={complexShaders} />
    </group>
  );
}

function NebulaVolumes({ complexShaders }) {
  const goldTex = useMemo(() => radialTexture("#c4a052", "nebula-gold"), []);
  const tealTex = useMemo(() => radialTexture("#4fd1be", "nebula-teal"), []);
  const ref = useRef();

  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.006;
  });

  const volumes = useMemo(
    () => [
      { pos: [-9, 3, -14], scale: 22, tex: goldTex, opacity: 0.22 },
      { pos: [11, -4, -18], scale: 26, tex: tealTex, opacity: 0.16 },
      { pos: [3, 6, -22], scale: 18, tex: goldTex, opacity: 0.14 },
      { pos: [-14, -6, -10], scale: 16, tex: tealTex, opacity: 0.12 },
    ],
    [goldTex, tealTex]
  );

  if (!complexShaders) return null;

  return (
    <group ref={ref}>
      {volumes.map((v, i) => (
        <sprite key={i} position={v.pos} scale={[v.scale, v.scale, 1]}>
          <spriteMaterial
            map={v.tex}
            transparent
            opacity={v.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}
