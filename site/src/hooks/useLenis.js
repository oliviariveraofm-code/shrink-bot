import { useEffect, useRef } from "react";
import Lenis from "lenis";

// Global smooth-scroll instance driven by rAF. Exposes scroll progress (0-1)
// and raw scroll value via a ref so consumers can read it inside their own
// rAF loops (three.js / gsap) without re-rendering React on every tick.
export function useLenis({ onScroll } = {}) {
  const lenisRef = useRef(null);
  const progressRef = useRef(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: !isReducedMotion,
      syncTouch: false,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ({ scroll, limit }) => {
      scrollRef.current = scroll;
      progressRef.current = limit > 0 ? scroll / limit : 0;
      onScroll?.({ scroll, limit, progress: progressRef.current });
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [onScroll]);

  return { lenisRef, progressRef, scrollRef };
}
