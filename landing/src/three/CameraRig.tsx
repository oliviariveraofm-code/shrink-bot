import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getIntroPhase } from "../lib/introState";
import { getScrollState } from "../lib/scrollStore";
import { pointer } from "../lib/scrollStore";
import { worldYForScrollY } from "../lib/sectionSync";
import { fxState } from "../lib/fxState";

export default function CameraRig() {
  const { camera } = useThree();
  const introSince = useRef<number | null>(null);
  const targetPos = useRef(new THREE.Vector3(0, 0, 6));
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const phase = getIntroPhase();
    const scroll = getScrollState();

    if (phase === "logo") {
      targetPos.current.set(0, 0, 6.2);
      lookTarget.current.set(0, 0, 0);
    } else {
      if (introSince.current === null) introSince.current = t;
      const worldY = worldYForScrollY(scroll.scrollY);
      const px = THREE.MathUtils.clamp(pointer.nx * 0.9, -1, 1);
      const py = THREE.MathUtils.clamp(pointer.ny * 0.5, -1, 1);
      const driftX = Math.sin(t * 0.08) * 0.6;

      const flyIn = phase === "splitting" ? THREE.MathUtils.smoothstep(t - (introSince.current ?? t), 0, 1.1) : 1;
      const z = THREE.MathUtils.lerp(6.2, 8.5, flyIn);

      targetPos.current.set(driftX + px * 0.7, worldY + py * 0.35, z);
      lookTarget.current.set(px * 0.3, worldY - 1.2, 0);

      fxState.chromaOffset = 0.0004 + Math.min(Math.abs(scroll.velocity) * 0.00003, 0.0035);
      fxState.vignetteDarkness = 1 + Math.min(Math.abs(scroll.velocity) * 0.01, 0.6);
    }

    const posLambda = phase === "logo" ? 4 : 3;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.current.x, posLambda, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.current.y, posLambda, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.current.z, posLambda, delta);

    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    const desiredDir = lookTarget.current.clone().sub(camera.position).normalize();
    const lookLambda = 3.2;
    const newDir = currentLook.clone().lerp(desiredDir, 1 - Math.exp(-lookLambda * delta)).normalize();
    camera.lookAt(camera.position.clone().add(newDir));
  });

  return null;
}
