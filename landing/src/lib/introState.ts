export type IntroPhase = "logo" | "splitting" | "revealed";

let phase: IntroPhase = "logo";
const listeners = new Set<() => void>();

export function getIntroPhase() {
  return phase;
}

export function setIntroPhase(p: IntroPhase) {
  phase = p;
  listeners.forEach((l) => l());
}

export function subscribeIntro(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
