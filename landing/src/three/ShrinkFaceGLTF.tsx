import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

const TEAL = new THREE.Color("#4FD1BE");
const GOLD = new THREE.Color("#C4A052");

interface Props {
  url: string;
  scale?: number;
  breatheSeconds?: number;
  /** Skip named sub-meshes — some downloaded assets bundle stray extra
   * geometry (a duplicate head, a reference cube) alongside the real one. */
  excludeNames?: string[];
}

const TARGET_DIAMETER = 3.1; // matches the old procedural head's ~1.55 radius

// Loads an external low-poly head/face .glb and restyles it to match the
// site's teal-faceted-fill + gold-wireframe look, rather than sculpting
// facial geometry procedurally (that approach repeatedly failed to
// produce legible features). All "alive" motion is GSAP-driven eased
// tweens — no per-frame procedural spin/bounce.
export default function ShrinkFaceGLTF({ url, scale = 1, breatheSeconds = 5, excludeNames = [] }: Props) {
  const { scene } = useGLTF(url);
  const outerGroup = useRef<THREE.Group>(null);
  const swayGroup = useRef<THREE.Group>(null);

  const restyled = useMemo(() => {
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
    meshes.forEach((mesh) => {
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.translate(-center.x, -center.y, -center.z);
      geometry.scale(fitScale, fitScale, fitScale);
      geometry.computeVertexNormals();

      const fillMesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: TEAL,
          flatShading: true,
          metalness: 0.15,
          roughness: 0.55,
          emissive: TEAL,
          emissiveIntensity: 0.08,
          toneMapped: false,
        })
      );

      const edgeLines = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, 15),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.85, toneMapped: false })
      );

      group.add(fillMesh, edgeLines);
    });

    return group;
  }, [scene, excludeNames]);

  // Idle sway (slow sine-driven rotation), breathing (subtle scale
  // pulse), and an occasional glance — all eased tweens, never linear,
  // no continuous spin/bounce.
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

    return () => {
      cancelled = true;
      tweens.forEach((tw) => tw.kill());
      glanceCall?.kill();
      gsap.killTweensOf(sway.rotation);
      gsap.killTweensOf(sway.scale);
      gsap.killTweensOf(outer.rotation);
    };
  }, [scale, breatheSeconds]);

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
