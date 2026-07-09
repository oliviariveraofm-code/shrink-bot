import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

// Slow autonomous orbit around the galaxy, nudged by mouse parallax.
// Pointer influence eases in/out so the camera never snaps.
export default function CameraRig({ radius = 30, height = 4, speed = 0.028, parallax = 2.4 }) {
  const angle = useRef(0);
  const eased = useRef({ x: 0, y: 0 });
  const { camera, pointer } = useThree();

  useFrame((state, delta) => {
    angle.current += delta * speed;

    eased.current.x += (pointer.x - eased.current.x) * 0.03;
    eased.current.y += (pointer.y - eased.current.y) * 0.03;

    const baseX = Math.sin(angle.current) * radius;
    const baseZ = Math.cos(angle.current) * radius;

    camera.position.x = baseX + eased.current.x * parallax;
    camera.position.y = height + eased.current.y * parallax * 0.6;
    camera.position.z = baseZ;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
