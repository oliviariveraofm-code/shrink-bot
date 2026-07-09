import { useEffect, useRef, useState } from "react";
import { subscribeTick } from "./scrollTicker";

// Tracks how far `ref`'s element has travelled through the viewport as a
// 0 -> 1 progress value (0 = enters bottom, 1 = exits top). Returned as a
// ref (no re-render) plus optional reactive state for components that need
// to re-render (e.g. nav morph, progress bar).
export function useScrollProgress(ref, { reactive = false } = {}) {
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsub = subscribeTick(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = rect.height + vh;
      const raw = (vh - rect.top) / total;
      const clamped = Math.min(1, Math.max(0, raw));
      progressRef.current = clamped;
      if (reactive) setProgress(clamped);
    });
    return unsub;
  }, [ref, reactive]);

  return reactive ? progress : progressRef;
}

export function useWindowScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const unsub = subscribeTick(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    });
    return unsub;
  }, []);
  return progress;
}
