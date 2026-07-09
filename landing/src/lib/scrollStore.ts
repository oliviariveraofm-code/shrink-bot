type Listener = () => void;

export interface ScrollState {
  scrollY: number;
  progress: number;
  velocity: number;
  docHeight: number;
  isMobile: boolean;
}

const state: ScrollState = {
  scrollY: 0,
  progress: 0,
  velocity: 0,
  docHeight: 1,
  isMobile: typeof window !== "undefined" ? window.innerWidth < 820 : false,
};

const listeners = new Set<Listener>();

export function setScroll(scrollY: number, velocity: number) {
  state.scrollY = scrollY;
  state.velocity = velocity;
  const max = Math.max(state.docHeight - window.innerHeight, 1);
  state.progress = Math.min(Math.max(scrollY / max, 0), 1);
  listeners.forEach((l) => l());
}

export function setDocHeight(h: number) {
  state.docHeight = h;
}

export function getScrollState(): ScrollState {
  return state;
}

export function subscribeScroll(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// mouse / pointer, tracked globally for parallax + magnetic buttons
export const pointer = { x: 0, y: 0, nx: 0, ny: 0 };

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = -(e.clientY / window.innerHeight) * 2 + 1;
    },
    { passive: true }
  );
}
