import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function hexPoints(radius) {
  const pts = [];
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
  }
  return pts;
}

// Floating hexagonal "TF" wireframe mark. Two nested hex rings + inner
// glyph lines, slow autonomous rotation, brightens when the pointer nears it.
export default function HexLogo({ position = [0, 0.6, 4] }) {
  const group = useRef();
  const inner = useRef();
  const outerMat = useRef();
  const innerMat = useRef();
  const { pointer } = useThree();
  const proximity = useRef(0);

  const outerGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(hexPoints(1.35)), []);
  const innerGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(hexPoints(0.85)), []);

  // Simple "T" and "F" strokes built from line segments inside the hex.
  const glyphPositions = useMemo(
    () =>
      new Float32Array([
        // T
        -0.55, 0.42, 0, -0.1, 0.42, 0,
        -0.32, 0.42, 0, -0.32, -0.42, 0,
        // F
        0.15, 0.42, 0, 0.15, -0.42, 0,
        0.15, 0.42, 0, 0.58, 0.42, 0,
        0.15, 0.02, 0, 0.5, 0.02, 0,
      ]),
    []
  );

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.22;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.12;
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.12;
    }
    if (inner.current) {
      inner.current.rotation.z -= delta * 0.35;
    }

    const dist = Math.hypot(pointer.x * 4 - position[0] * 0.3, pointer.y * 3 - position[1] * 0.3);
    const target = THREE.MathUtils.clamp(1 - dist / 3, 0, 1);
    proximity.current += (target - proximity.current) * 0.06;

    if (outerMat.current) outerMat.current.opacity = 0.55 + proximity.current * 0.45;
    if (innerMat.current) innerMat.current.opacity = 0.35 + proximity.current * 0.5;
    if (group.current) {
      const s = 1 + proximity.current * 0.08;
      group.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group} position={position}>
      <line geometry={outerGeo}>
        <lineBasicMaterial ref={outerMat} color="#e8c774" transparent opacity={0.6} />
      </line>
      <group ref={inner}>
        <line geometry={innerGeo}>
          <lineBasicMaterial ref={innerMat} color="#4fd1be" transparent opacity={0.4} />
        </line>
      </group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[glyphPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#eae7de" transparent opacity={0.85} />
      </lineSegments>
    </group>
  );
}
