import { useEffect, useRef } from "react";
import { subscribeTick } from "@/hooks/scrollTicker";

const SEGMENT = "l 18,0 l 6,-8 l 8,26 l 10,-46 l 8,34 l 6,-6 l 18,0";
const PATH_D = `M 0,60 ${SEGMENT.repeat(1)} ${"l 18,0 l 6,-8 l 8,26 l 10,-46 l 8,34 l 6,-6 l 18,0 ".repeat(7)} l 40,0`;

export default function ECGLine({ className = "" }) {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const wrap = wrapRef.current;
    if (!path || !wrap) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const unsub = subscribeTick(() => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const raw = (vh - rect.top) / (rect.height + vh);
      const progress = Math.min(1, Math.max(0, raw));
      path.style.strokeDashoffset = `${length * (1 - progress)}`;
    });

    return unsub;
  }, []);

  return (
    <div ref={wrapRef} className={className}>
      <svg viewBox="0 0 800 120" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <path
          d={PATH_D}
          fill="none"
          stroke="rgba(79,209,190,0.12)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          ref={pathRef}
          d={PATH_D}
          fill="none"
          stroke="#4fd1be"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(79,209,190,0.65))" }}
        />
      </svg>
    </div>
  );
}
