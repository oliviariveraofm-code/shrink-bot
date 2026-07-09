import { useEffect, useRef, useState } from "react";

const VOTES = { long: 9, short: 1, flat: 2 };

// Central hero artifact: a "live" consensus trade card rendered in DOM/CSS so
// the data stays crisp, tilted in real 3D space via CSS perspective and eased
// toward the pointer. Hologram scanlines + chromatic-aberration edge glow.
export default function TradeCard() {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf;
    let targetRX = 0,
      targetRY = 0,
      curRX = 0,
      curRY = 0;

    function onMove(e) {
      const rect = wrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetRY = px * 22;
      targetRX = -py * 16;
    }
    function onLeave() {
      targetRX = 0;
      targetRY = 0;
    }
    function loop() {
      curRX += (targetRX - curRX) * 0.08;
      curRY += (targetRY - curRY) * 0.08;
      card.style.transform = `rotateX(${curRX.toFixed(2)}deg) rotateY(${curRY.toFixed(2)}deg)`;
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const total = VOTES.long + VOTES.short + VOTES.flat;

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto w-[280px] sm:w-[320px] [perspective:1200px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={cardRef}
        className={`relative rounded-xl border transition-shadow duration-300 [transform-style:preserve-3d] backdrop-blur-md
          ${hovered ? "border-[var(--color-gold)] shadow-[0_0_55px_-8px_rgba(196,160,82,0.55)]" : "border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]"}
        `}
        style={{ background: "linear-gradient(160deg, rgba(25,27,34,0.92), rgba(14,15,19,0.96))" }}
      >
        <div className="hologram-scan absolute inset-0 rounded-xl overflow-hidden" />

        {/* chromatic aberration edge */}
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-70"
          style={{
            boxShadow: hovered
              ? "0 0 0 1px rgba(79,209,190,0.35), -1.5px 0 0 rgba(209,82,79,0.25), 1.5px 0 0 rgba(79,209,190,0.25)"
              : "0 0 0 1px rgba(255,255,255,0.06)",
          }}
        />

        <div className="relative p-5 [transform:translateZ(24px)]">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[0.6rem]">Live Consensus</span>
            <span className="flex items-center gap-1.5 text-[0.65rem] font-mono-num text-[var(--color-teal)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal)] animate-pulse" />
              8/12 QUORUM
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-xl font-semibold tracking-tight">XAUUSD</div>
              <div className="text-[0.65rem] text-[var(--color-ink-dim)] font-mono-num">Gold Spot · London Overlap</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono-num text-[var(--color-gold-bright)]">2,412.85</div>
              <div className="text-[0.65rem] font-mono-num text-[var(--color-teal)]">+0.34%</div>
            </div>
          </div>

          <div className="mt-5 h-px w-full bg-white/10" />

          <div className="mt-4 space-y-2">
            {Object.entries(VOTES).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="w-9 text-[0.6rem] uppercase tracking-wider text-[var(--color-ink-dim)] font-mono-num">
                  {k}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(v / total) * 100}%`,
                      background:
                        k === "long"
                          ? "linear-gradient(90deg,#c4a052,#e8c774)"
                          : k === "short"
                          ? "linear-gradient(90deg,#8a4b49,#d1524f)"
                          : "linear-gradient(90deg,#3a3b44,#5c5d66)",
                    }}
                  />
                </div>
                <span className="w-4 text-right text-[0.65rem] font-mono-num text-[var(--color-ink-dim)]">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <span className="text-[0.62rem] uppercase tracking-widest text-[var(--color-ink-dim)]">Call</span>
            <span className="text-xs font-semibold text-[var(--color-gold-bright)]">CONSENSUS: LONG</span>
          </div>
        </div>
      </div>
    </div>
  );
}
