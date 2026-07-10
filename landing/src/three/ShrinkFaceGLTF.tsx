import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { getScrollState, pointer } from "../lib/scrollStore";

const TEAL = new THREE.Color("#4FD1BE");
const GOLD = new THREE.Color("#C4A052");

interface Props {
  url: string;
  scale?: number;
  breatheSeconds?: number;
  /** Skip named sub-meshes — some downloaded assets bundle stray extra
   * geometry (a duplicate head, a reference cube) alongside the real one. */
  excludeNames?: string[];
  /** Name of the sub-mesh to treat as the jaw/mouth region for the
   * subtle "talking" movement. Pass "" to disable. */
  jawMeshName?: string;
  /** Names of sub-meshes to treat as eyes and rotate to track scroll/pointer. */
  eyeMeshNames?: string[];
}

const TARGET_DIAMETER = 3.1; // matches the old procedural head's ~1.55 radius

// Y bounds (in the normalized/centered TARGET_DIAMETER space) of the
// mouth-to-chin band, calibrated against the "Human Head Base Mesh" asset:
// fixed above the nose, fully movable through lips+chin, fixed again
// once it reaches the neck.
const JAW_UPPER_FIXED_Y = 0.15;
const JAW_UPPER_MOVING_Y = -0.15;
const JAW_LOWER_MOVING_Y = -0.55;
const JAW_LOWER_FIXED_Y = -0.75;
const JAW_DROP = 0.12;
const JAW_RECEDE = 0.04;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

interface JawRig {
  geometry: THREE.BufferGeometry;
  basePositions: Float32Array;
  weights: Float32Array;
  edgeMesh: THREE.LineSegments;
}

// Loads an external low-poly head/face .glb and restyles it to match the
// site's teal-faceted-fill + gold-wireframe look, rather than sculpting
// facial geometry procedurally (that approach repeatedly failed to
// produce legible features).
//
// "Alive" motion layers, all eased (never linear) and never a continuous
// spin/bounce:
//  - idle sway + breathing + occasional glance: GSAP tweens on the whole
//    head (same pattern proven on the old procedural version)
//  - a subtle jaw/mouth movement: GSAP timeline nudging a vertex weight
//    mask in the mouth-to-chin region, in occasional short "almost
//    talking" bursts
//  - eyes: damped per-frame rotation toward scroll direction / pointer,
//    since that's a continuously-changing target rather than a
//    discrete state change
export default function ShrinkFaceGLTF({
  url,
  scale = 1,
  breatheSeconds = 5,
  excludeNames = [],
  jawMeshName = "Cube",
  eyeMeshNames = ["Cube001"],
}: Props) {
  const { scene } = useGLTF(url);
  const outerGroup = useRef<THREE.Group>(null);
  const swayGroup = useRef<THREE.Group>(null);
  const eyesPivot = useRef<THREE.Group>(null);
  const jawRigRef = useRef<JawRig | null>(null);
  const eyeYaw = useRef(0);
  const eyePitch = useRef(0);

  const { restyled, jawRig } = useMemo(() => {
    const cloned = scene.clone(true);
    const meshes: THREE.Mesh[] = [];
    cloned.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && !excludeNames.includes(mesh.name)) meshes.push(mesh);
    });

    // auto-center + auto-scale to a consistent size, so any dropped-in
    // asset frames the same way regardless of its native modeling units
    const bounds = new THREE.Box3();
    meshes.forEach((mesh) => bounds.expandByObject(mesh));
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const fitScale = TARGET_DIAMETER / Math.max(size.x, size.y, size.z, 1e-6);

    const group = new THREE.Group();
    let jawRig: JawRig | null = null;
    const eyeMeshes: THREE.Mesh[] = [];

    const makeFillMaterial = () =>
      new THREE.MeshStandardMaterial({
        color: TEAL,
        flatShading: true,
        metalness: 0.15,
        roughness: 0.55,
        emissive: TEAL,
        emissiveIntensity: 0.08,
        toneMapped: false,
      });
    const makeEdgeMaterial = () =>
      new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.85, toneMapped: false });

    meshes.forEach((mesh) => {
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.translate(-center.x, -center.y, -center.z);
      geometry.scale(fitScale, fitScale, fitScale);
      geometry.computeVertexNormals();

      if (eyeMeshNames.includes(mesh.name)) {
        eyeMeshes.push(new THREE.Mesh(geometry, mesh.material));
        return;
      }

      const fillMesh = new THREE.Mesh(geometry, makeFillMaterial());
      const edgeMesh = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 15), makeEdgeMaterial());
      group.add(fillMesh, edgeMesh);

      if (mesh.name === jawMeshName) {
        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        const basePositions = Float32Array.from(posAttr.array);
        const weights = new Float32Array(posAttr.count);
        for (let i = 0; i < posAttr.count; i++) {
          const y = basePositions[i * 3 + 1];
          const wTop = smoothstep(JAW_UPPER_FIXED_Y, JAW_UPPER_MOVING_Y, y);
          const wBot = 1 - smoothstep(JAW_LOWER_MOVING_Y, JAW_LOWER_FIXED_Y, y);
          weights[i] = Math.min(wTop, wBot);
        }
        jawRig = { geometry, basePositions, weights, edgeMesh };
      }
    });

    // eyes: re-centered to their own pivot so rotating looks like the
    // eyes turning in their sockets, not the whole head tilting
    if (eyeMeshes.length) {
      const eyeBounds = new THREE.Box3();
      eyeMeshes.forEach((m) => eyeBounds.expandByObject(m));
      const eyeCenter = eyeBounds.getCenter(new THREE.Vector3());
      const pivot = new THREE.Group();
      pivot.position.copy(eyeCenter);

      // plain UV spheres have no iris/pupil marker, so rotating them
      // alone doesn't read as "looking" — split each eye mesh's
      // vertices by which side of center they're on and drop a small
      // dark pupil on the front of each cluster
      const clusters = [
        { sumX: 0, sumY: 0, sumZ: 0, maxZ: -Infinity, n: 0 }, // left (-x)
        { sumX: 0, sumY: 0, sumZ: 0, maxZ: -Infinity, n: 0 }, // right (+x)
      ];
      eyeMeshes.forEach((m) => {
        const pos = m.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i) - eyeCenter.x;
          const y = pos.getY(i) - eyeCenter.y;
          const z = pos.getZ(i) - eyeCenter.z;
          const c = clusters[x < 0 ? 0 : 1];
          c.sumX += x;
          c.sumY += y;
          c.sumZ += z;
          c.maxZ = Math.max(c.maxZ, z);
          c.n++;
        }
      });
      const pupilMat = new THREE.MeshBasicMaterial({ color: "#0b1512", toneMapped: false });
      clusters.forEach((c) => {
        if (!c.n) return;
        const cx = c.sumX / c.n;
        const cy = c.sumY / c.n;
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), pupilMat);
        pupil.position.set(cx, cy, c.maxZ + 0.03);
        pivot.add(pupil);
      });

      eyeMeshes.forEach((m) => {
        const geo = m.geometry.clone();
        geo.translate(-eyeCenter.x, -eyeCenter.y, -eyeCenter.z);
        const fillMesh = new THREE.Mesh(geo, makeFillMaterial());
        const edgeMesh = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 15), makeEdgeMaterial());
        pivot.add(fillMesh, edgeMesh);
      });
      pivot.name = "__eyesPivot";
      group.add(pivot);
    }

    return { restyled: group, jawRig };
  }, [scene, excludeNames, jawMeshName, eyeMeshNames]);

  useEffect(() => {
    jawRigRef.current = jawRig;
  }, [jawRig]);

  // find the eyes pivot placed inside `restyled` and hand it to the ref
  // used by the per-frame eye-tracking below
  useEffect(() => {
    eyesPivot.current = (restyled.getObjectByName("__eyesPivot") as THREE.Group) ?? null;
  }, [restyled]);

  // Idle sway (slow sine-driven rotation), breathing (subtle scale
  // pulse), an occasional glance, and a subtle jaw/mouth "almost
  // talking" movement — all eased tweens, never linear, no continuous
  // spin/bounce.
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
    let talkCall: gsap.core.Tween | null = null;
    let talkTimeline: gsap.core.Timeline | null = null;
    let cancelled = false;

    function scheduleGlance() {
      if (cancelled || !outer) return;
      const delay = 8 + Math.random() * 7;
      glanceCall = gsap.delayedCall(delay, () => {
        if (cancelled || !outer) return;
        const targetX = THREE.MathUtils.degToRad((Math.random() - 0.5) * 10);
        const targetY = THREE.MathUtils.degToRad((Math.random() - 0.5) * 14);
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

    // rebuilding EdgesGeometry re-derives triangle adjacency from scratch —
    // real but non-trivial cost, so only do it every few ticks during a
    // burst (the deformation is subtle enough that a couple of frames of
    // stale wireframe is imperceptible) instead of on every GSAP onUpdate
    let edgeUpdateTick = 0;
    function applyJawOpen(open: number, forceEdgeUpdate = false) {
      const rig = jawRigRef.current;
      if (!rig) return;
      const { geometry, basePositions, weights } = rig;
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < weights.length; i++) {
        const w = weights[i];
        arr[i * 3] = basePositions[i * 3];
        arr[i * 3 + 1] = basePositions[i * 3 + 1] - w * open * JAW_DROP;
        arr[i * 3 + 2] = basePositions[i * 3 + 2] - w * open * JAW_RECEDE;
      }
      posAttr.needsUpdate = true;
      geometry.computeVertexNormals();
      edgeUpdateTick++;
      if (forceEdgeUpdate || edgeUpdateTick % 3 === 0) {
        rig.edgeMesh.geometry.dispose();
        rig.edgeMesh.geometry = new THREE.EdgesGeometry(geometry, 15);
      }
    }

    function scheduleTalk() {
      if (cancelled) return;
      const delay = 5 + Math.random() * 6;
      talkCall = gsap.delayedCall(delay, () => {
        if (cancelled || !jawRigRef.current) {
          scheduleTalk();
          return;
        }
        const state = { open: 0 };
        const bursts = 2 + Math.floor(Math.random() * 3);
        const tl = gsap.timeline({
          onComplete: () => {
            if (!cancelled) scheduleTalk();
          },
        });
        for (let i = 0; i < bursts; i++) {
          const peak = 0.35 + Math.random() * 0.65;
          tl.to(state, {
            open: peak,
            duration: 0.12 + Math.random() * 0.08,
            ease: "power2.inOut",
            onUpdate: () => applyJawOpen(state.open),
          });
          tl.to(state, {
            open: 0.05 + Math.random() * 0.1,
            duration: 0.1 + Math.random() * 0.08,
            ease: "power2.inOut",
            onUpdate: () => applyJawOpen(state.open),
          });
        }
        tl.to(state, {
          open: 0,
          duration: 0.25,
          ease: "power2.inOut",
          onUpdate: () => applyJawOpen(state.open),
          onComplete: () => applyJawOpen(0, true),
        });
        talkTimeline = tl;
      });
    }
    scheduleTalk();

    return () => {
      cancelled = true;
      tweens.forEach((tw) => tw.kill());
      glanceCall?.kill();
      talkCall?.kill();
      talkTimeline?.kill();
      gsap.killTweensOf(sway.rotation);
      gsap.killTweensOf(sway.scale);
      gsap.killTweensOf(outer.rotation);
    };
  }, [scale, breatheSeconds]);

  // Eyes: a continuously-changing target (scroll direction + pointer)
  // needs continuous per-frame damping rather than discrete GSAP tweens
  // — THREE.MathUtils.damp is an exponential ease, so it's smooth and
  // non-robotic without being a GSAP "state to state" tween.
  useFrame((_state, delta) => {
    const pivot = eyesPivot.current;
    if (!pivot) return;
    const { velocity } = getScrollState();
    const targetPitch = THREE.MathUtils.clamp(-velocity * 0.012, -0.14, 0.14);
    const targetYaw = THREE.MathUtils.clamp(pointer.nx * 0.16, -0.14, 0.14);
    eyePitch.current = THREE.MathUtils.damp(eyePitch.current, targetPitch, 3, delta);
    eyeYaw.current = THREE.MathUtils.damp(eyeYaw.current, targetYaw, 3, delta);
    pivot.rotation.x = eyePitch.current;
    pivot.rotation.y = eyeYaw.current;
  });

  return (
    <group ref={outerGroup}>
      <group ref={swayGroup} scale={scale}>
        {/* symmetric off-axis lights baked into the component itself so
            the face's facets throw real, even shadow no matter where
            this mounts — a parent scene's light is usually close to
            camera-coaxial, which flattens facet contrast on one side
            more than the other (or all of it) */}
        <pointLight position={[1.7, 1.1, 2.3]} intensity={2.6} distance={9} decay={2} color="#eafff5" />
        <pointLight position={[-1.7, 1.1, 2.3]} intensity={2.6} distance={9} decay={2} color="#eafff5" />
        <primitive object={restyled} />
      </group>
    </group>
  );
}
