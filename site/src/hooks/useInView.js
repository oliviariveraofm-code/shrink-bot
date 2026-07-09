import { useEffect, useRef, useState } from "react";

// Mounts expensive canvases only once their section nears the viewport, and
// keeps them mounted afterward (avoids remount cost on scroll back up).
export function useInView({ rootMargin = "35% 0px 35% 0px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
