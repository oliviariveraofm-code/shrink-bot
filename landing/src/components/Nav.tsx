import { useEffect, useRef, useState } from "react";
import { getScrollState } from "../lib/scrollStore";
import MagneticButton from "./MagneticButton";
import "./nav.css";

const LINKS = [
  { label: "Agents", href: "#agents" },
  { label: "The Shrink", href: "#shrink" },
  { label: "Sessions", href: "#sessions" },
  { label: "Rules", href: "#rules" },
  { label: "Pricing", href: "#pricing" },
];

export default function Nav({ onOpenLogin }: { onOpenLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const wasScrolled = useRef(false);

  useEffect(() => {
    let raf = 0;
    function loop() {
      const { scrollY } = getScrollState();
      const next = scrollY > 60;
      if (next !== wasScrolled.current) {
        wasScrolled.current = next;
        setScrolled(next);
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <nav className={`tf-nav ${scrolled ? "tf-nav--bar" : "tf-nav--dock"}`}>
      <a className="tf-nav__brand" href="#top">
        <span className="tf-nav__hex" />
        THE TRADING FLOOR
      </a>
      <ul className="tf-nav__links">
        {LINKS.map((l) => (
          <li key={l.href}>
            <MagneticButton className="tf-nav__link" href={l.href} radius={50} strength={0.3}>
              {l.label}
            </MagneticButton>
          </li>
        ))}
      </ul>
      <MagneticButton className="tf-nav__cta" onClick={onOpenLogin} radius={50} strength={0.3}>
        Enter The Floor
      </MagneticButton>
    </nav>
  );
}
