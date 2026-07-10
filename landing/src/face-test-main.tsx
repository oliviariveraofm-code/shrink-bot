import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ShrinkFaceGLTF from "./three/ShrinkFaceGLTF";
import shrinkHeadUrl from "./assets/models/shrink-head.glb?url";

// Isolated harness for iterating on the GLTF face model — loaded via its
// own Vite entry (face-test.html) so it never touches the live page.
const MODEL_URL = shrinkHeadUrl;

function Scene() {
  return (
    <Canvas camera={{ fov: 50, position: [0, 0, 6] }} gl={{ antialias: true }}>
      <color attach="background" args={["#0e0f13"]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 2, 4]} intensity={3} distance={12} />
      <pointLight position={[-3, 2, 4]} intensity={3} distance={12} />
      <Suspense fallback={null}>
        <ShrinkFaceGLTF url={MODEL_URL} scale={1} excludeNames={["Cube002"]} />
      </Suspense>
      <OrbitControls enableDamping />
    </Canvas>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Scene />
  </StrictMode>
);
