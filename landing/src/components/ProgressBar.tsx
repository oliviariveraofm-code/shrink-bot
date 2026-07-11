import { useEffect, useRef } from "react";
import { getScrollState } from "../lib/scrollStore";
import "./progress-bar.css";

export default function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    function loop() {
      const { progress } = getScrollState();
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="progress-track" aria-hidden="true">
      <div className="progress-fill" ref={barRef} />
    </div>
  );
}
