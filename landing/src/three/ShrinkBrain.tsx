import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cameraState } from "../lib/cameraState";

const GOLD = new THREE.Color("#C4A052");
const CULL_DISTANCE = 22;

interface Props {
  scale?: number;
  worldY?: number;
  ySpinSeconds?: number;
  xTiltSeconds?: number;
  breatheSeconds?: number;
  heartbeatSeconds?: number;
  alignBoost?: React.MutableRefObject<number>;
}

export default function ShrinkBrain({
  scale = 1,
  worldY = 0,
  ySpinSeconds = 20,
  xTiltSeconds = 8,
  breatheSeconds = 4,
  heartbeatSeconds = 1.5,
  alignBoost,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const nodeMat = useRef<THREE.PointsMaterial>(null);
  const coreMat = useRef<THREE.MeshBasicMaterial>(null);
  const electronsRef = useRef<THREE.Points>(null);

  const { edgesGeo, nodesGeo } = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(1.6, 2);
    const posAttr = base.attributes.position as THREE.BufferAttribute;
    const jittered = posAttr.array.slice() as Float32Array;
    for (let i = 0; i < jittered.length; i += 3) {
      const n = 1 + (Math.random() - 0.5) * 0.16;
      jittered[i] *= n;
      jittered[i + 1] *= n * (0.82 + Math.random() * 0.1);
      jittered[i + 2] *= n;
    }
    base.setAttribute("position", new THREE.BufferAttribute(jittered, 3));
    base.computeVertexNormals();

    const edgesGeo = new THREE.EdgesGeometry(base, 1);
    const nodesGeo = new THREE.BufferGeometry();
    nodesGeo.setAttribute("position", new THREE.BufferAttribute(jittered, 3));
    return { edgesGeo, nodesGeo };
  }, []);

  const electronsGeo = useMemo(() => {
    const n = 220;
    const arr = new Float32Array(n * 3);
    const radii = new Float32Array(n);
    const speeds = new Float32Array(n);
    const incl = new Float32Array(n);
    const phase = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      radii[i] = 2.1 + Math.random() * 1.2;
      speeds[i] = 0.15 + Math.random() * 0.4;
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
      group.current.rotation.y += (Math.PI * 2 * delta) / ySpinSeconds;
      group.current.rotation.x = Math.sin((t * Math.PI * 2) / xTiltSeconds) * 0.18;
      const breathe = 1 + Math.sin((t * Math.PI * 2) / breatheSeconds) * 0.05;
      group.current.scale.setScalar(scale * breathe);
    }
    const heartbeat = Math.pow(Math.max(Math.sin((t * Math.PI * 2) / heartbeatSeconds), 0), 3);
    const boost = alignBoost?.current ?? 0;
    const intensity = 0.85 + heartbeat * 0.6 + boost * 0.7;

    if (edgeMat.current) edgeMat.current.color.copy(GOLD).multiplyScalar(intensity);
    if (nodeMat.current) {
      nodeMat.current.color.copy(GOLD).multiplyScalar(intensity * 1.2);
      nodeMat.current.size = 0.045 + heartbeat * 0.03 + boost * 0.04;
    }
    if (coreMat.current) {
      coreMat.current.color.copy(GOLD).multiplyScalar(0.5 + heartbeat * 0.5);
      coreMat.current.opacity = 0.05 + heartbeat * 0.05 + boost * 0.08;
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
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial ref={edgeMat} color="#C4A052" transparent opacity={0.9} toneMapped={false} />
      </lineSegments>
      <points geometry={nodesGeo}>
        <pointsMaterial
          ref={nodeMat}
          size={0.05}
          color="#C4A052"
          transparent
          opacity={0.95}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>
      <mesh>
        <sphereGeometry args={[1.55, 24, 24]} />
        <meshBasicMaterial ref={coreMat} color="#C4A052" transparent opacity={0.06} depthWrite={false} />
      </mesh>
      <points ref={electronsRef} geometry={electronsGeo.geo}>
        <pointsMaterial size={0.035} color="#C4A052" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation toneMapped={false} />
      </points>
    </group>
  );
}
