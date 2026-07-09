import { useEffect, useState } from "react";

// Coarse device classification used to scale particle counts / shader
// complexity. Re-evaluated on resize (orientation change on tablets).
export function useDeviceTier() {
  const [tier, setTier] = useState(() => classify());

  useEffect(() => {
    function onResize() {
      setTier(classify());
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return tier;
}

function classify() {
  if (typeof window === "undefined") {
    return { isMobile: false, particleCount: 20000, dpr: 1.5, complexShaders: true };
  }
  const isMobile = window.innerWidth < 820 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const veryLowConcurrency = (navigator.hardwareConcurrency || 8) <= 2;
  const isLow = isMobile || veryLowConcurrency;

  return {
    isMobile,
    reducedMotion,
    particleCount: isLow ? 8000 : 20000,
    dustCount: isLow ? 200 : 600,
    dpr: isLow ? 1 : Math.min(window.devicePixelRatio || 1, 2),
    complexShaders: !isLow,
  };
}
