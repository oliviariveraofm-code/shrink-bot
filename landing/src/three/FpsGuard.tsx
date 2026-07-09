import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface Props {
  onSlow: () => void;
  onRecovered?: () => void;
}

// Watches real frame time and asks the parent to step render quality down
// when it's consistently missing the 60fps budget, instead of drei's
// PerformanceMonitor + AdaptiveDpr pairing (which turned out to be two
// disconnected systems that didn't actually talk to each other).
export default function FpsGuard({ onSlow, onRecovered }: Props) {
  const slowFrames = useRef(0);
  const goodFrames = useRef(0);
  const cooldown = useRef(0);

  useFrame((_, delta) => {
    if (cooldown.current > 0) {
      cooldown.current -= delta;
      return;
    }
    // budget a little above 16.6ms (60fps) so we don't react to one-off hitches
    if (delta > 0.028) {
      slowFrames.current++;
      goodFrames.current = 0;
      if (slowFrames.current > 45) {
        onSlow();
        slowFrames.current = 0;
        cooldown.current = 2;
      }
    } else {
      goodFrames.current++;
      slowFrames.current = 0;
      if (goodFrames.current > 240 && onRecovered) {
        onRecovered();
        goodFrames.current = 0;
        cooldown.current = 4;
      }
    }
  });

  return null;
}
