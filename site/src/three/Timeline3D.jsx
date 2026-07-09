import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SESSIONS, SESSION_COLORS } from "@/data/sessions";

const ANGLE_RANGE = Math.PI * 1.7;
const RADIUS = 8;

function curvePoint(hour) {
  const t = hour / 24;
  const angle = -ANGLE_RANGE / 2 + t * ANGLE_RANGE;
  const x = Math.sin(angle) * RADIUS;
  const z = Math.cos(angle) * RADIUS - RADIUS * 0.35;
  const y = Math.sin(t * Math.PI * 3.4) * 0.85;
  return new THREE.Vector3(x, y, z);
}

function buildTube(startHour, endHour, radius, segments = 24) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const h = startHour + ((endHour - startHour) * i) / segments;
    pts.push(curvePoint(h));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, segments, radius, 8, false);
}

export default function Timeline3D({ progressRef, complexShaders = true }) {
  const group = useRef();
  const glowRefs = useRef([]);

  const segments = useMemo(
    () =>
      SESSIONS.map((s) => ({
        ...s,
        geometry: buildTube(s.start, s.end, s.type === "dead" ? 0.045 : s.type === "prime" ? 0.13 : 0.09),
      })),
    []
  );

  const markers = useMemo(() => {
    const hours = [0, 3, 6, 9, 12, 15, 18, 21];
    return hours.map((h) => ({
      h,
      pos: curvePoint(h).add(new THREE.Vector3(0, 0.55 + (h % 6 === 0 ? 0.35 : 0), 0)),
      label: `${String(h).padStart(2, "0")}:00`,
    }));
  }, []);

  useFrame((state) => {
    if (group.current && progressRef) {
      const target = progressRef.current * Math.PI * 0.9 - 0.2;
      group.current.rotation.y += (target - group.current.rotation.y) * 0.06;
    }
    const t = state.clock.elapsedTime;
    glowRefs.current.forEach((m, i) => {
      if (!m) return;
      m.material.opacity = 0.55 + Math.sin(t * 1.6 + i) * 0.25;
    });
  });

  return (
    <group ref={group}>
      {segments.map((s, i) => (
        <mesh
          key={s.id}
          geometry={s.geometry}
          ref={(node) => {
            if (s.type !== "dead") glowRefs.current[i] = node;
          }}
        >
          <meshBasicMaterial
            color={SESSION_COLORS[s.type]}
            transparent
            opacity={s.type === "dead" ? 0.25 : s.type === "prime" ? 0.9 : 0.6}
            toneMapped={false}
          />
        </mesh>
      ))}

      {markers.map((m) => (
        <group key={m.h} position={m.pos}>
          <mesh>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#e8c774" />
          </mesh>
          {complexShaders && (
            <Html position={[0, 0.32, 0]} center occlude={false} zIndexRange={[10, 0]}>
              <span className="whitespace-nowrap font-mono text-[11px] tracking-wide text-[var(--color-gold)]">
                {m.label}
              </span>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}
