import { useEffect, useRef } from "react";
import { subscribeTick } from "@/hooks/scrollTicker";

// Chromatic-aberration edge fringe that intensifies briefly with scroll
// velocity, then eases back to rest. Pure CSS box-shadow, no canvas cost.
export default function ScrollAberration() {
  const ref = useRef(null);
  const lastY = useRef(0);
  const intensity = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const unsub = subscribeTick(() => {
      const y = window.scrollY;
      const velocity = Math.min(Math.abs(y - lastY.current), 60);
      lastY.current = y;
      intensity.current += (velocity / 60 - intensity.current) * 0.15;
      const el = ref.current;
      if (el) {
        const amt = intensity.current;
        el.style.boxShadow = `inset 3px 0 0 -1px rgba(209,82,79,${(amt * 0.35).toFixed(3)}), inset -3px 0 0 -1px rgba(79,209,190,${(amt * 0.35).toFixed(3)})`;
        el.style.opacity = `${Math.min(amt * 1.4, 1).toFixed(3)}`;
      }
    });
    return unsub;
  }, []);

  return <div ref={ref} className="pointer-events-none fixed inset-0 z-[88]" aria-hidden="true" />;
}
