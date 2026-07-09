// Single shared rAF loop that all scroll-linked visuals subscribe to,
// instead of every component running its own requestAnimationFrame.
const listeners = new Set();
let running = false;
let rafId = null;

function tick(time) {
  for (const fn of listeners) fn(time);
  rafId = requestAnimationFrame(tick);
}

export function subscribeTick(fn) {
  listeners.add(fn);
  if (!running) {
    running = true;
    rafId = requestAnimationFrame(tick);
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && rafId) {
      cancelAnimationFrame(rafId);
      running = false;
      rafId = null;
    }
  };
}
