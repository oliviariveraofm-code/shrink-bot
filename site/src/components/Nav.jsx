import { useEffect, useState } from "react";
import { subscribeTick } from "@/hooks/scrollTicker";
import { useWindowScrollProgress } from "@/hooks/useScrollProgress";
import { useMagnetic } from "@/hooks/useMagnetic";

const LINKS = [
  { href: "#agents", label: "Agents" },
  { href: "#shrink", label: "The Shrink" },
  { href: "#sessions", label: "Sessions" },
  { href: "#rules", label: "Rules" },
];

export default function Nav() {
  const [docked, setDocked] = useState(false);
  const progress = useWindowScrollProgress();
  const magneticRef = useMagnetic(0.25);

  useEffect(() => {
    const unsub = subscribeTick(() => {
      setDocked((prev) => {
        const next = window.scrollY > 120;
        return next === prev ? prev : next;
      });
    });
    return unsub;
  }, []);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[100] h-[2px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-gold-bright)] to-[var(--color-teal)] transition-[width] duration-75"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <nav
        className={`fixed left-1/2 z-[95] -translate-x-1/2 transition-all duration-500 ease-out ${
          docked ? "top-4 w-[min(94vw,780px)] rounded-full border border-white/10 bg-[#14161c]/85 px-3 py-2 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl" : "top-0 w-full rounded-none border-transparent bg-transparent px-6 py-5 sm:px-10"
        }`}
      >
        <div className="flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-2 shrink-0">
            <svg viewBox="0 0 100 100" className={`transition-all ${docked ? "h-6 w-6" : "h-7 w-7"}`}>
              <polygon points="50,8 87,29 87,71 50,92 13,71 13,29" fill="none" stroke="#c4a052" strokeWidth="5" />
              <polygon points="50,28 69,39 69,61 50,72 31,61 31,39" fill="none" stroke="#4fd1be" strokeWidth="3" />
            </svg>
            <span className={`font-display text-xs font-semibold tracking-[0.2em] text-[var(--color-ink)] transition-all ${docked ? "hidden sm:inline" : "inline"}`}>
              THE TRADING FLOOR
            </span>
          </a>

          <div className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-xs uppercase tracking-wider text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-gold-bright)]"
              >
                {l.label}
              </a>
            ))}
          </div>

          <a
            ref={magneticRef}
            href="#join"
            className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)] font-medium text-[#14161c] transition-all hover:bg-[var(--color-gold-bright)] ${
              docked ? "px-4 py-1.5 text-xs" : "px-5 py-2 text-sm"
            }`}
          >
            Join Discord
          </a>
        </div>
      </nav>
    </>
  );
}
