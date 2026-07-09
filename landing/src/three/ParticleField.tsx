import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { pointer } from "../lib/scrollStore";

const GOLD = new THREE.Color("#C4A052");
const TEAL = new THREE.Color("#4FD1BE");

function makeGlowTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.6)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

interface Props {
  count: number;
  worldHeight: number;
  radius?: number;
}

export default function ParticleField({ count, worldHeight, radius = 26 }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const { camera } = useThree();
  const texture = useMemo(() => makeGlowTexture(), []);

  const { positions, colors, baseX, baseZ, speeds, phase } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const baseX = new Float32Array(count);
    const baseZ = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phase = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const layer = Math.random();
      const r = Math.sqrt(Math.random()) * radius * (0.4 + layer * 0.6);
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = -Math.random() * worldHeight + 6;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      baseX[i] = x;
      baseZ[i] = z;
      speeds[i] = 0.15 + Math.random() * 0.5 + (1 - layer) * 0.3;
      phase[i] = Math.random() * Math.PI * 2;

      const c = Math.random() > 0.55 ? GOLD : TEAL;
      const jitter = 0.85 + Math.random() * 0.3;
      colors[i * 3] = c.r * jitter;
      colors[i * 3 + 1] = c.g * jitter;
      colors[i * 3 + 2] = c.b * jitter;
    }
    return { positions, colors, baseX, baseZ, speeds, phase };
  }, [count, worldHeight, radius]);

  const pointerWorld = useRef(new THREE.Vector3(0, 0, 8));
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -8), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const maxSegments = 40;
  const linePositions = useMemo(() => new Float32Array(maxSegments * 2 * 3), []);

  useFrame((state, delta) => {
    const geo = pointsRef.current?.geometry;
    if (!geo) return;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = state.clock.elapsedTime;

    const ndc = new THREE.Vector2(pointer.nx, pointer.ny);
    raycaster.setFromCamera(ndc, camera);
    const hit = new THREE.Vector3();
    plane.constant = -(camera.position.z - 10);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      pointerWorld.current.lerp(hit, 0.08);
    }

    const swirlRadius = 6;
    for (let i = 0; i < count; i++) {
      let y = arr[i * 3 + 1] + speeds[i] * delta * 0.6;
      if (y > 8) y = -worldHeight + 4;
      arr[i * 3 + 1] = y;

      let x = baseX[i] + Math.sin(t * 0.2 + phase[i]) * 0.6;
      let z = baseZ[i] + Math.cos(t * 0.18 + phase[i]) * 0.6;

      const dx = x - pointerWorld.current.x;
      const dz = z - pointerWorld.current.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < swirlRadius) {
        const strength = (1 - dist / swirlRadius) * 1.4;
        const ang = Math.atan2(dz, dx) + strength * 0.9;
        const rad = dist + strength * 0.5;
        x = pointerWorld.current.x + Math.cos(ang) * rad;
        z = pointerWorld.current.z + Math.sin(ang) * rad;
      }

      arr[i * 3] = x;
      arr[i * 3 + 2] = z;
    }
    posAttr.needsUpdate = true;

    // constellation lines: scan a stride subset near pointer
    const lineGeo = lineRef.current?.geometry;
    if (lineGeo) {
      const candidates: number[] = [];
      const stride = 5;
      for (let i = 0; i < count; i += stride) {
        const dx = arr[i * 3] - pointerWorld.current.x;
        const dy = arr[i * 3 + 1] - pointerWorld.current.y;
        const dz = arr[i * 3 + 2] - pointerWorld.current.z;
        if (dx * dx + dy * dy + dz * dz < swirlRadius * swirlRadius) {
          candidates.push(i);
          if (candidates.length > 26) break;
        }
      }
      let segCount = 0;
      outer: for (let a = 0; a < candidates.length; a++) {
        for (let b = a + 1; b < candidates.length; b++) {
          const ia = candidates[a] * 3;
          const ib = candidates[b] * 3;
          const dx = arr[ia] - arr[ib];
          const dy = arr[ia + 1] - arr[ib + 1];
          const dz = arr[ia + 2] - arr[ib + 2];
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < 4.5) {
            const o = segCount * 6;
            linePositions[o] = arr[ia];
            linePositions[o + 1] = arr[ia + 1];
            linePositions[o + 2] = arr[ia + 2];
            linePositions[o + 3] = arr[ib];
            linePositions[o + 4] = arr[ib + 1];
            linePositions[o + 5] = arr[ib + 2];
            segCount++;
            if (segCount >= maxSegments) break outer;
          }
        }
      }
      const lineAttr = lineGeo.attributes.position as THREE.BufferAttribute;
      (lineAttr.array as Float32Array).set(linePositions);
      lineAttr.needsUpdate = true;
      lineGeo.setDrawRange(0, segCount * 2);
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          map={texture}
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#C4A052" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
}
