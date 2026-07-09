import { useEffect, useRef } from "react";
import type { ReactNode, MouseEvent as ReactMouseEvent } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  radius?: number;
  strength?: number;
  ariaLabel?: string;
}

export default function MagneticButton({ children, className, href, onClick, radius = 70, strength = 0.35, ariaLabel }: Props) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef(0);

  useEffect(() => {
    function loop() {
      current.current.x += (target.current.x - current.current.x) * 0.2;
      current.current.y += (target.current.y - current.current.y) * 0.2;
      if (ref.current) {
        ref.current.style.transform = `translate(${current.current.x.toFixed(2)}px, ${current.current.y.toFixed(2)}px)`;
      }
      rafId.current = requestAnimationFrame(loop);
    }
    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  function onMove(e: ReactMouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < radius) {
      const s = 1 - dist / radius;
      target.current.x = dx * strength * s;
      target.current.y = dy * strength * s;
    } else {
      target.current.x = 0;
      target.current.y = 0;
    }
  }

  function onLeave() {
    target.current.x = 0;
    target.current.y = 0;
  }

  const Comp: any = href ? "a" : "button";

  return (
    <Comp
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Comp>
  );
}
