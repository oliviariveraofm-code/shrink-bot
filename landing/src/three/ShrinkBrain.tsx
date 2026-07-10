import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cameraState } from "../lib/cameraState";
import { pointer } from "../lib/scrollStore";

const GOLD = new THREE.Color("#C4A052");
const TEAL = new THREE.Color("#4FD1BE");
const CULL_DISTANCE = 22;

interface Props {
  scale?: number;
  worldY?: number;
  breatheSeconds?: number;
  heartbeatSeconds?: number;
  alignBoost?: React.MutableRefObject<number>;
}

// Sculpts a jittered icosahedron into a low-poly faceted face/mask
// silhouette: narrower + taller than a sphere, tapered at the chin and
// crown, flatter at the back of the skull than the front, with a pair
// of indented eye sockets and a raised nose ridge.
function sculptFace(x: number, y: number, z: number, radius: number, seed: number) {
  const nx = x / radius;
  const ny = y / radius;
  const nz = z / radius;

  let sx = 0.74;
  let sy = 1.18;
  let sz = nz > 0 ? 0.86 : 0.56;

  if (ny < -0.1) {
    const t = Math.min((-ny - 0.1) / 0.9, 1);
    const taper = 1 - 0.58 * t * t;
    sx *= taper;
    sz *= taper;
  }
  if (ny > 0.55) {
    const t = Math.min((ny - 0.55) / 0.45, 1);
    sx *= 1 - 0.2 * t;
    sz *= 1 - 0.1 * t;
  }

  let px = nx * sx;
  let py = ny * sy;
  let pz = nz * sz;

  if (nz > 0.15) {
    for (const sideX of [-0.36, 0.36]) {
      const dx = nx - sideX;
      const dy = ny - 0.1;
      const d2 = dx * dx * 2.4 + dy * dy * 3.4;
      if (d2 < 0.055) {
        pz -= (1 - d2 / 0.055) * 0.13;
      }
    }
    if (Math.abs(nx) < 0.15 && ny > -0.3 && ny < 0.18) {
      const t = 1 - Math.abs(nx) / 0.15;
      pz += t * 0.1;
    }
    if (ny < -0.35 && ny > -0.62 && Math.abs(nx) < 0.3) {
      pz += (1 - Math.abs(nx) / 0.3) * 0.05;
    }
  }

  const jitter = 1 + (seed - 0.5) * 0.05;
  return [px * radius * jitter, py * radius * jitter, pz * radius * jitter] as const;
}

function makeScanTexture() {
  const w = 8;
  const h = 64;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(79,209,190,0)");
  grad.addColorStop(0.45, "rgba(79,209,190,0.15)");
  grad.addColorStop(0.5, "rgba(210,255,248,0.95)");
  grad.addColorStop(0.55, "rgba(79,209,190,0.15)");
  grad.addColorStop(1, "rgba(79,209,190,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  return new THREE.CanvasTexture(canvas);
}

export default function ShrinkBrain({
  scale = 1,
  worldY = 0,
  breatheSeconds = 4,
  heartbeatSeconds = 1.5,
  alignBoost,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const nodeMat = useRef<THREE.PointsMaterial>(null);
  const faceMat = useRef<THREE.MeshStandardMaterial>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const scanMat = useRef<THREE.MeshBasicMaterial>(null);
  const electronsRef = useRef<THREE.Points>(null);

  const yaw = useRef(0);
  const pitch = useRef(0);

  const scanTexture = useMemo(() => makeScanTexture(), []);

  const { faceGeo, edgesGeo, nodesGeo } = useMemo(() => {
    const radius = 1.55;
    const base = new THREE.IcosahedronGeometry(radius, 2);
    const posAttr = base.attributes.position as THREE.BufferAttribute;
    const src = posAttr.array as Float32Array;
    const sculpted = new Float32Array(src.length);
    for (let i = 0; i < src.length; i += 3) {
      const [px, py, pz] = sculptFace(src[i], src[i + 1], src[i + 2], radius, Math.random());
      sculpted[i] = px;
      sculpted[i + 1] = py;
      sculpted[i + 2] = pz;
    }
    const faceGeo = base.clone();
    faceGeo.setAttribute("position", new THREE.BufferAttribute(sculpted, 3));
    faceGeo.computeVertexNormals();

    const edgesGeo = new THREE.EdgesGeometry(faceGeo, 8);
    const nodesGeo = new THREE.BufferGeometry();
    nodesGeo.setAttribute("position", new THREE.BufferAttribute(sculpted, 3));
    return { faceGeo, edgesGeo, nodesGeo };
  }, []);

  const electronsGeo = useMemo(() => {
    const n = 160;
    const arr = new Float32Array(n * 3);
    const radii = new Float32Array(n);
    const speeds = new Float32Array(n);
    const incl = new Float32Array(n);
    const phase = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      radii[i] = 2.0 + Math.random() * 1.1;
      speeds[i] = 0.12 + Math.random() * 0.32;
      incl[i] = Math.random() * Math.PI;
      phase[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return { geo, radii, speeds, incl, phase, n };
  }, []);

  useFrame((state, delta) => {
    if (Math.abs(cameraState.worldY - worldY) > CULL_DISTANCE) return;
    const t = state.clock.elapsedTime;

    if (group.current) {
      // idle "looking around" wander, gently biased toward the cursor,
      // instead of a constant spin — reads as attentive rather than a
      // spinning showpiece
      const wander = Math.sin(t * 0.23) * 0.55 + Math.sin(t * 0.11 + 1.7) * 0.3;
      const pointerBias = THREE.MathUtils.clamp(pointer.nx, -1, 1) * 0.35;
      const targetYaw = wander * 0.45 + pointerBias;
      const targetPitch = Math.sin(t * 0.17 + 0.6) * 0.1 + THREE.MathUtils.clamp(pointer.ny, -1, 1) * 0.12;

      yaw.current = THREE.MathUtils.damp(yaw.current, targetYaw, 2.2, delta);
      pitch.current = THREE.MathUtils.damp(pitch.current, targetPitch, 2.2, delta);
      group.current.rotation.y = yaw.current;
      group.current.rotation.x = pitch.current;

      const breathe = 1 + Math.sin((t * Math.PI * 2) / breatheSeconds) * 0.045;
      group.current.scale.setScalar(scale * breathe);
    }

    const heartbeat = Math.pow(Math.max(Math.sin((t * Math.PI * 2) / heartbeatSeconds), 0), 3);
    const boost = alignBoost?.current ?? 0;
    const intensity = 0.9 + heartbeat * 0.55 + boost * 0.7;

    if (edgeMat.current) edgeMat.current.color.copy(GOLD).multiplyScalar(intensity);
    if (nodeMat.current) {
      nodeMat.current.color.copy(GOLD).multiplyScalar(intensity * 1.15);
      nodeMat.current.size = 0.04 + heartbeat * 0.025 + boost * 0.035;
    }
    if (faceMat.current) {
      faceMat.current.emissiveIntensity = 0.35 + heartbeat * 0.25 + boost * 0.4;
    }

    // scanner sweep: constant-speed triangle wave, not sine, for a
    // mechanical "scanning" feel rather than a bouncing one
    if (scanRef.current) {
      const period = 4.2;
      const phase = (t % period) / period;
      const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      scanRef.current.position.y = THREE.MathUtils.lerp(-1.9, 1.9, tri);
      if (scanMat.current) {
        scanMat.current.opacity = 0.5 + heartbeat * 0.3;
      }
    }

    const eArr = (electronsGeo.geo.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < electronsGeo.n; i++) {
      const a = t * electronsGeo.speeds[i] + electronsGeo.phase[i];
      const r = electronsGeo.radii[i];
      const inc = electronsGeo.incl[i];
      eArr[i * 3] = Math.cos(a) * r;
      eArr[i * 3 + 1] = Math.sin(a) * r * Math.sin(inc) * 0.6;
      eArr[i * 3 + 2] = Math.sin(a) * r * Math.cos(inc);
    }
    (electronsGeo.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <group ref={group}>
      <mesh geometry={faceGeo}>
        <meshStandardMaterial
          ref={faceMat}
          color={TEAL}
          emissive={TEAL}
          emissiveIntensity={0.4}
          flatShading
          metalness={0.25}
          roughness={0.35}
          transparent
          opacity={0.48}
          toneMapped={false}
        />
      </mesh>
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial ref={edgeMat} color="#C4A052" transparent opacity={0.85} toneMapped={false} />
      </lineSegments>
      <points geometry={nodesGeo}>
        <pointsMaterial
          ref={nodeMat}
          size={0.045}
          color="#C4A052"
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>
      <mesh ref={scanRef} rotation={[0, 0, 0]}>
        <planeGeometry args={[2.6, 0.5]} />
        <meshBasicMaterial
          ref={scanMat}
          map={scanTexture}
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <points ref={electronsRef} geometry={electronsGeo.geo}>
        <pointsMaterial size={0.032} color="#C4A052" transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation toneMapped={false} />
      </points>
    </group>
  );
}
