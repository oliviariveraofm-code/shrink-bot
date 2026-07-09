import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setDocHeight, setScroll } from "./scrollStore";
import { measureSections } from "./sectionSync";

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);

let lenisInstance: Lenis | null = null;

export function getLenis() {
  return lenisInstance;
}

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    lenisInstance = lenis;

    setDocHeight(document.documentElement.scrollHeight);

    lenis.on("scroll", ({ scroll, velocity }: { scroll: number; velocity: number }) => {
      setScroll(scroll, velocity);
      ScrollTrigger.update();
    });

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    let rafId = requestAnimationFrame(raf);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    const resize = () => {
      setDocHeight(document.documentElement.scrollHeight);
      measureSections();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(document.body);

    const t = setTimeout(resize, 300);
    const t2 = setTimeout(resize, 1200);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisInstance = null;
      window.removeEventListener("resize", resize);
      resizeObserver.disconnect();
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);
}
