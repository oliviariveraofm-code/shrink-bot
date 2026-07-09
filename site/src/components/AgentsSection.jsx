import { useEffect, useRef } from "react";
import gsap from "gsap";
import { AGENTS } from "@/data/agents";
import AgentCard from "./AgentCard";

const DEPTH_PATTERN = [0, -60, -30, -90, -15, -70, -40, -100, -5, -55, -25, -80];

export default function AgentsSection() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  cardRefs.current = [];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let revealed = false;
    function reveal() {
      if (revealed) return;
      revealed = true;
      const cards = cardRefs.current;
      cards.forEach((card) => card.classList.add("is-revealed"));
      gsap.fromTo(
        cards,
        { z: -500, opacity: 0, rotateX: 12 },
        {
          z: (i) => DEPTH_PATTERN[i % DEPTH_PATTERN.length],
          opacity: 1,
          rotateX: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: { each: 0.07, from: "start" },
        }
      );
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);

    // Safety net: guarantee the cards become visible even if the observer
    // never fires (e.g. page loads mid-scroll, or embedded in unusual contexts).
    const fallback = setTimeout(reveal, 4000);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <section id="agents" ref={sectionRef} className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="eyebrow">The Floor</div>
          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
            Twelve agents. <span className="text-gradient-gold">Zero solo calls.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--color-ink-dim)] sm:text-base">
            Each agent runs its own read on the market — independently, adversarially — before The Chair
            checks for quorum. Hover a card to see what it actually watches.
          </p>
        </div>

        <div
          className="mx-auto mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
          style={{ perspective: "1600px" }}
        >
          {AGENTS.map((agent, i) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              index={i}
              depth={DEPTH_PATTERN[i % DEPTH_PATTERN.length]}
              ref={(node) => {
                if (node) cardRefs.current[i] = node;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
