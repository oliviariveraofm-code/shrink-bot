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
}

// Loads an external low-poly head/face .glb and restyles it to match the
// site's teal-faceted-fill + gold-wireframe look, rather than sculpting
// facial geometry procedurally (that approach repeatedly failed to
// produce legible features). All "alive" motion is GSAP-driven eased
// tweens — no per-frame procedural spin/bounce.
export default function ShrinkFaceGLTF({ url, scale = 1, breatheSeconds = 5 }: Props) {
  const { scene } = useGLTF(url);
  const outerGroup = useRef<THREE.Group>(null);
  const swayGroup = useRef<THREE.Group>(null);

  const restyled = useMemo(() => {
    const cloned = scene.clone(true);
    const group = new THREE.Group();

    cloned.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const geometry = mesh.geometry;
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
      fillMesh.position.copy(mesh.position);
      fillMesh.rotation.copy(mesh.rotation);
      fillMesh.scale.copy(mesh.scale);

      const edgeLines = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, 15),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.85, toneMapped: false })
      );
      edgeLines.position.copy(mesh.position);
      edgeLines.rotation.copy(mesh.rotation);
      edgeLines.scale.copy(mesh.scale);

      group.add(fillMesh, edgeLines);
    });

    return group;
  }, [scene]);

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
