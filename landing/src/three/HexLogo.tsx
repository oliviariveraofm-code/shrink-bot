import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { setIntroPhase } from "../lib/introState";

const GOLD = "#C4A052";

function hexHalfShape(side: "left" | "right", r: number) {
  const top = new THREE.Vector2(0, r);
  const bottom = new THREE.Vector2(0, -r);
  const sign = side === "left" ? -1 : 1;
  const upper = new THREE.Vector2(sign * r * Math.cos(Math.PI / 6), r * Math.sin(Math.PI / 6));
  const lower = new THREE.Vector2(sign * r * Math.cos(Math.PI / 6), -r * Math.sin(Math.PI / 6));
  const shape = new THREE.Shape();
  shape.moveTo(top.x, top.y);
  shape.lineTo(upper.x, upper.y);
  shape.lineTo(lower.x, lower.y);
  shape.lineTo(bottom.x, bottom.y);
  shape.lineTo(top.x, top.y);
  return shape;
}

function makeTFTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#C4A052";
  ctx.font = "700 128px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#C4A052";
  ctx.shadowBlur = 24;
  ctx.fillText("TF", size / 2, size / 2 + 8);
  return new THREE.CanvasTexture(canvas);
}

export default function HexLogo({ delaySeconds = 2 }: { delaySeconds?: number }) {
  const root = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const flash = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Sprite>(null);
  const started = useRef(false);
  const splitStart = useRef<number | null>(null);
  const doneFired = useRef(false);

  const leftGeo = useMemo(() => new THREE.ExtrudeGeometry(hexHalfShape("left", 1.4), { depth: 0.14, bevelEnabled: false }), []);
  const rightGeo = useMemo(() => new THREE.ExtrudeGeometry(hexHalfShape("right", 1.4), { depth: 0.14, bevelEnabled: false }), []);
  const tfTexture = useMemo(() => makeTFTexture(), []);

  useEffect(() => {
    setIntroPhase("logo");
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!started.current) started.current = true;

    if (splitStart.current === null && t > delaySeconds) {
      splitStart.current = t;
      setIntroPhase("splitting");
    }

    if (root.current) {
      const bob = Math.sin((t * Math.PI * 2) / 3) * 0.12;
      root.current.position.y = bob;
      const heartbeat = Math.pow(Math.max(Math.sin((t * Math.PI * 2) / 1.5), 0), 4);
      const pulse = 1 + heartbeat * 0.08;
      root.current.scale.setScalar(pulse);
      root.current.rotation.y = Math.sin(t * 0.3) * 0.15;
    }

    if (splitStart.current !== null) {
      const st = t - splitStart.current;
      const prog = Math.min(st / 1.1, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      if (left.current) {
        left.current.position.x = -ease * 2.6;
        left.current.rotation.y = ease * -0.6;
      }
      if (right.current) {
        right.current.position.x = ease * 2.6;
        right.current.rotation.y = ease * 0.6;
      }
      const fadeOpacity = Math.max(1 - prog * 1.3, 0);
      [left.current, right.current].forEach((g) => {
        g?.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.material) {
            (mesh.material as THREE.MeshStandardMaterial).transparent = true;
            (mesh.material as THREE.MeshStandardMaterial).opacity = fadeOpacity;
          }
        });
      });

      if (flash.current) {
        const fp = Math.min(st / 0.55, 1);
        const s = 0.2 + fp * 9;
        flash.current.scale.setScalar(s);
        const mat = flash.current.material as THREE.MeshBasicMaterial;
        mat.opacity = st < 0.55 ? (1 - fp) * 1.2 : 0;
      }
      if (textRef.current) {
        const mat = textRef.current.material as THREE.SpriteMaterial;
        mat.opacity = Math.max(1 - prog * 2, 0);
      }

      if (prog >= 1) {
        if (root.current) root.current.visible = false;
        if (flash.current) flash.current.visible = false;
        if (!doneFired.current) {
          doneFired.current = true;
          setIntroPhase("revealed");
        }
      }
    }
  });

  return (
    <group visible>
      <group ref={root}>
        <group ref={left}>
          <mesh geometry={leftGeo}>
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.9} metalness={0.6} roughness={0.25} transparent depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
        <group ref={right}>
          <mesh geometry={rightGeo}>
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.9} metalness={0.6} roughness={0.25} transparent depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
        <sprite ref={textRef} position={[0, 0, 0.2]} scale={[1.1, 1.1, 1]}>
          <spriteMaterial map={tfTexture} transparent depthWrite={false} toneMapped={false} />
        </sprite>
      </group>
      <mesh ref={flash} position={[0, 0, 0.3]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#FFF6DF" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}
