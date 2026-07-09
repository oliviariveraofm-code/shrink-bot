import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AGENTS } from "../data/agents";
import "./agents-section.css";

gsap.registerPlugin(ScrollTrigger);

export default function AgentsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pushRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pushTarget = useRef<{ x: number; y: number }[]>(AGENTS.map(() => ({ x: 0, y: 0 })));
  const pushCurrent = useRef<{ x: number; y: number }[]>(AGENTS.map(() => ({ x: 0, y: 0 })));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cellRefs.current,
        { z: -800, opacity: 0 },
        {
          z: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let raf = 0;
    function loop() {
      pushRefs.current.forEach((el, i) => {
        const t = pushTarget.current[i];
        const c = pushCurrent.current[i];
        c.x += (t.x - c.x) * 0.12;
        c.y += (t.y - c.y) * 0.12;
        if (el) el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;
      });
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  function onGridMove(e: React.MouseEvent) {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    cellRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = cx - e.clientX;
      const dy = cy - e.clientY;
      const dist = Math.hypot(dx, dy);
      const radius = 180;
      if (dist < radius) {
        const s = (1 - dist / radius) * 16;
        pushTarget.current[i] = { x: (dx / (dist || 1)) * s, y: (dy / (dist || 1)) * s };
      } else {
        pushTarget.current[i] = { x: 0, y: 0 };
      }
    });
  }

  function onGridLeave() {
    pushTarget.current = AGENTS.map(() => ({ x: 0, y: 0 }));
  }

  function onEmblemEnter(el: HTMLDivElement | null) {
    if (!el) return;
    el.classList.remove("spin-once");
    void el.offsetWidth;
    el.classList.add("spin-once");
  }

  return (
    <section className="section agents-section" id="agents" data-section="agents" ref={sectionRef}>
      <div className="section-label">The Team In Motion</div>
      <h2 className="section-title">Twelve specialists. Zero autopilot.</h2>
      <p className="section-sub">
        Each agent runs its own read on the market. The Shrink only lets a call through when enough of the room agrees.
      </p>
      <div className="agents-grid" ref={gridRef} onMouseMove={onGridMove} onMouseLeave={onGridLeave}>
        {AGENTS.map((agent, i) => (
          <div
            className="agent-cell"
            key={agent.id}
            ref={(el) => { cellRefs.current[i] = el; }}
            style={{ "--depth": `${(i % 3) * 14 - 14}px` } as React.CSSProperties}
          >
            <div
              className="agent-drift"
              style={{
                animationDuration: `${6 + (i % 5)}s, ${3.4 + (i % 4) * 0.4}s, ${9 + (i % 3) * 1.6}s`,
                animationDelay: `${(i * 0.31) % 4}s`,
              }}
            >
              <div className="agent-push" ref={(el) => { pushRefs.current[i] = el; }}>
                <div
                  className="agent-card"
                  style={{ "--agent-color": agent.color } as React.CSSProperties}
                  tabIndex={0}
                >
                  <div className="agent-card__emblem" onMouseEnter={(e) => onEmblemEnter(e.currentTarget)}>
                    <div className="agent-card__emblem-hex" />
                  </div>
                  <div className="agent-card__name">{agent.name}</div>
                  <div className="agent-card__role">{agent.role}</div>
                  <p className="agent-card__desc">{agent.desc}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
