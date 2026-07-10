import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { cameraState } from "../lib/cameraState";

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

function gaussian(v: number, center: number, width: number) {
  const d = (v - center) / width;
  return Math.exp(-d * d);
}

// Sculpts a jittered icosahedron into a low-poly faceted *human* head:
// rounded cranium, defined brow ridge, two indented eye sockets, a
// raised nose bridge + tip, a subtle mouth line, and a jaw that tapers
// to a rounded (not spiked) chin — proportioned against the reference
// (wider/shorter than a teardrop, chin blunt rather than pointed).
// Also returns a per-vertex "shade" (0..~1.4): the eye sockets and
// mouth groove darken it and the brow/nose ridge brighten it, baked in
// as vertex colors rather than left to depend on light angle — with a
// nearly camera-aligned point light, recessed geometry alone doesn't
// throw enough shadow to read as facial features.
function sculptFace(x: number, y: number, z: number, radius: number, seed: number) {
  const nx = x / radius;
  const ny = y / radius;
  const nz = z / radius;

  let sx = 0.82;
  let sy = 1.08;
  let sz = nz > 0 ? 0.8 : 0.52;

  // round off the crown
  if (ny > 0.5) {
    const t = Math.min((ny - 0.5) / 0.5, 1);
    sx *= 1 - 0.24 * t;
    sz *= 1 - 0.2 * t;
  }

  // cheek -> jaw -> chin: stays fairly wide through the jaw, then a
  // capped taper so the chin ends rounded/blunt instead of a spike
  if (ny < -0.02) {
    const t = Math.min((-ny - 0.02) / 0.98, 1);
    const taper = 1 - 0.56 * Math.pow(t, 1.7);
    sx *= Math.max(taper, 0.38);
    sz *= Math.max(taper, 0.42);
  }

  let px = nx * sx;
  let py = ny * sy;
  let pz = nz * sz;
  // resting baseline sits below the bloom threshold so only the raised
  // features (brow/nose/cheekbone) glow — recessed features (eyes/mouth)
  // stay solidly dark instead of getting bloom-bled into a single blob
  let shade = 0.42;

  // facial features live on the front hemisphere only — displacements are
  // deliberately large relative to head radius so they read as distinct
  // angular facets on a low-poly base rather than a smooth blended bump
  if (nz > 0.02) {
    // brow ridge: a horizontal bulge spanning both eyes
    const browBand = gaussian(ny, 0.26, 0.09);
    if (Math.abs(nx) < 0.52) {
      const m = browBand * (1 - Math.abs(nx) / 0.52);
      pz += m * 0.34;
      shade += m * 0.8;
    }

    // two eye socket indentations, set just below the brow
    for (const sideX of [-0.32, 0.32]) {
      const dx = (nx - sideX) / 0.21;
      const dy = (ny - 0.04) / 0.18;
      const d2 = dx * dx + dy * dy;
      if (d2 < 1) {
        const m = 1 - d2;
        pz -= m * 0.48;
        shade -= m * 1.4;
      }
    }

    // nose bridge running down the center, widening slightly at the tip
    const noseWidth = ny < -0.18 ? 0.16 : 0.1;
    const noseMask = Math.max(0, 1 - Math.abs(nx) / noseWidth);
    if (ny > -0.34 && ny < 0.2) {
      const m = noseMask * gaussian(ny, -0.05, 0.35);
      pz += m * 0.36;
      shade += m * 0.65;
    }
    const tipDx = nx / 0.12;
    const tipDy = (ny + 0.3) / 0.11;
    const tipD = Math.hypot(tipDx, tipDy);
    if (tipD < 1) {
      pz += (1 - tipD) * 0.16;
      shade += (1 - tipD) * 0.3;
    }
    // nostril shadow either side of the tip
    for (const sideX of [-0.09, 0.09]) {
      const dx = (nx - sideX) / 0.075;
      const dy = (ny + 0.34) / 0.09;
      const d2 = dx * dx + dy * dy;
      if (d2 < 1) shade -= (1 - d2) * 0.4;
    }

    // mouth line: a shallow horizontal groove beneath the nose
    const mouthBand = gaussian(ny, -0.48, 0.05);
    if (Math.abs(nx) < 0.26) {
      const m = mouthBand * (1 - Math.abs(nx) / 0.26);
      pz -= m * 0.2;
      shade -= m * 1.0;
    }
    // faint upper-lip ridge just above the mouth line
    const lipBand = gaussian(ny, -0.41, 0.045);
    if (Math.abs(nx) < 0.2) {
      const m = lipBand * (1 - Math.abs(nx) / 0.2);
      pz += m * 0.09;
      shade += m * 0.28;
    }

    // chin: slight forward presence so it doesn't read as concave
    if (ny < -0.66 && Math.abs(nx) < 0.24) {
      pz += 0.1 * (1 - Math.abs(nx) / 0.24);
    }

    // cheekbone highlight, either side of the nose
    for (const sideX of [-0.44, 0.44]) {
      const dx = (nx - sideX) / 0.26;
      const dy = (ny + 0.08) / 0.22;
      const d2 = dx * dx + dy * dy;
      if (d2 < 1) shade += (1 - d2) * 0.16;
    }
  }

  const jitter = 1 + (seed - 0.5) * 0.03;
  return [px * radius * jitter, py * radius * jitter, pz * radius * jitter, Math.max(shade, 0.04)] as const;
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
  breatheSeconds = 5,
  heartbeatSeconds = 1.5,
  alignBoost,
}: Props) {
  const outerGroup = useRef<THREE.Group>(null);
  const swayGroup = useRef<THREE.Group>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const nodeMat = useRef<THREE.PointsMaterial>(null);
  const faceMat = useRef<THREE.MeshStandardMaterial>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const scanMat = useRef<THREE.MeshBasicMaterial>(null);
  const electronsRef = useRef<THREE.Points>(null);

  const scanTexture = useMemo(() => makeScanTexture(), []);

  const { faceGeo, edgesGeo, nodesGeo } = useMemo(() => {
    const radius = 1.55;
    // a regular lat-long grid (not an icosahedron) so every facial feature
    // is guaranteed several vertices to displace/shade, regardless of
    // where on the sphere it's centered — icosahedron subdivision has
    // no control over where its sparse vertices happen to land
    const base = new THREE.SphereGeometry(radius, 20, 16);
    const posAttr = base.attributes.position as THREE.BufferAttribute;
    const src = posAttr.array as Float32Array;
    const vertCount = src.length / 3;
    const sculpted = new Float32Array(src.length);
    const shadeColors = new Float32Array(src.length);
    for (let i = 0; i < vertCount; i++) {
      const [px, py, pz, shade] = sculptFace(src[i * 3], src[i * 3 + 1], src[i * 3 + 2], radius, Math.random());
      sculpted[i * 3] = px;
      sculpted[i * 3 + 1] = py;
      sculpted[i * 3 + 2] = pz;
      shadeColors[i * 3] = TEAL.r * shade;
      shadeColors[i * 3 + 1] = TEAL.g * shade;
      shadeColors[i * 3 + 2] = TEAL.b * shade;
    }
    const faceGeo = base.clone();
    faceGeo.setAttribute("position", new THREE.BufferAttribute(sculpted, 3));
    faceGeo.setAttribute("color", new THREE.BufferAttribute(shadeColors, 3));
    faceGeo.computeVertexNormals();

    const edgesGeo = new THREE.EdgesGeometry(faceGeo, 15);
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

  // All "alive" gesture motion (idle sway, breathing, the occasional
  // glance) is GSAP-driven rather than computed per-frame — deliberate
  // eased tweens instead of a continuous procedural spin/bounce.
  useEffect(() => {
    const sway = swayGroup.current;
    const outer = outerGroup.current;
    if (!sway || !outer) return;

    const tweens: gsap.core.Tween[] = [];

    tweens.push(
      gsap.to(sway.rotation, {
        y: THREE.MathUtils.degToRad(7),
        duration: 5.2,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      }),
      gsap.to(sway.rotation, {
        x: THREE.MathUtils.degToRad(4.5),
        duration: 6.7,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.6,
      }),
      gsap.fromTo(
        sway.scale,
        { x: scale, y: scale, z: scale },
        {
          x: scale * 1.015,
          y: scale * 1.015,
          z: scale * 1.015,
          duration: breatheSeconds / 2,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        }
      )
    );

    let glanceCall: gsap.core.Tween | null = null;
    let cancelled = false;

    function scheduleGlance() {
      if (cancelled || !outer) return;
      const delay = 8 + Math.random() * 7;
      glanceCall = gsap.delayedCall(delay, () => {
        if (cancelled || !outer) return;
        const targetX = THREE.MathUtils.degToRad((Math.random() - 0.5) * 12);
        const targetY = THREE.MathUtils.degToRad((Math.random() - 0.5) * 16);
        gsap.to(outer.rotation, {
          x: targetX,
          y: targetY,
          duration: 0.75 + Math.random() * 0.35,
          ease: "power2.inOut",
          onComplete: () => {
            if (cancelled || !outer) return;
            gsap.to(outer.rotation, {
              x: 0,
              y: 0,
              duration: 1.1 + Math.random() * 0.5,
              ease: "power2.inOut",
              onComplete: scheduleGlance,
            });
          },
        });
      });
    }
    scheduleGlance();

    return () => {
      cancelled = true;
      tweens.forEach((tw) => tw.kill());
      glanceCall?.kill();
      gsap.killTweensOf(sway.rotation);
      gsap.killTweensOf(sway.scale);
      gsap.killTweensOf(outer.rotation);
    };
  }, [scale, breatheSeconds]);

  useFrame((state) => {
    if (Math.abs(cameraState.worldY - worldY) > CULL_DISTANCE) return;
    const t = state.clock.elapsedTime;

    const heartbeat = Math.pow(Math.max(Math.sin((t * Math.PI * 2) / heartbeatSeconds), 0), 3);
    const boost = alignBoost?.current ?? 0;
    const intensity = 0.9 + heartbeat * 0.55 + boost * 0.7;

    if (edgeMat.current) edgeMat.current.color.copy(GOLD).multiplyScalar(intensity);
    if (nodeMat.current) {
      nodeMat.current.color.copy(GOLD).multiplyScalar(intensity * 1.15);
      nodeMat.current.size = 0.04 + heartbeat * 0.025 + boost * 0.035;
    }
    if (faceMat.current) {
      // multiplicative pulse (not additive emissive) so it brightens
      // without flattening the vertex-color contrast between the
      // brow/nose highlights and the eye/mouth shadows
      const pulse = 0.92 + heartbeat * 0.22 + boost * 0.3;
      faceMat.current.color.setScalar(pulse);
    }

    // scanner sweep: constant-speed triangle wave, not sine, for a
    // mechanical "scanning" feel rather than a bouncing one
    if (scanRef.current) {
      const period = 4.2;
      const phase = (t % period) / period;
      const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      scanRef.current.position.y = THREE.MathUtils.lerp(-1.7, 1.7, tri);
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
    <group ref={outerGroup}>
      <group ref={swayGroup} scale={scale}>
        {/* symmetric pair of off-axis lights so the sculpted brow/eye/
            nose/jaw facets throw real shadow on BOTH sides evenly — the
            scene's main point light sits almost coaxial with the camera
            and washes out geometry; a single off-axis light instead
            raked one side harder than the other */}
        <pointLight position={[1.7, 1.1, 2.3]} intensity={2.6} distance={9} decay={2} color="#eafff5" />
        <pointLight position={[-1.7, 1.1, 2.3]} intensity={2.6} distance={9} decay={2} color="#eafff5" />
        <mesh geometry={faceGeo}>
          <meshStandardMaterial
            ref={faceMat}
            color="#ffffff"
            vertexColors
            flatShading
            metalness={0.15}
            roughness={0.55}
            emissive={TEAL}
            emissiveIntensity={0.05}
            toneMapped={false}
          />
        </mesh>
        <lineSegments geometry={edgesGeo}>
          <lineBasicMaterial ref={edgeMat} color="#C4A052" transparent opacity={0.85} toneMapped={false} />
        </lineSegments>
        <points geometry={nodesGeo}>
          <pointsMaterial
            ref={nodeMat}
            size={0.04}
            color="#C4A052"
            transparent
            opacity={0.9}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </points>
        <mesh ref={scanRef}>
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
    </group>
  );
}
