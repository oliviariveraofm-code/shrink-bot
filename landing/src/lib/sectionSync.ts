import { SECTION_IDS, sectionWorldY } from "./worldLayout";

const offsets: number[] = SECTION_IDS.map(() => 0);
let measured = false;

export function measureSections() {
  SECTION_IDS.forEach((id, i) => {
    const el = document.querySelector(`[data-section="${id}"]`) as HTMLElement | null;
    offsets[i] = el ? el.offsetTop : i * 900;
  });
  measured = true;
}

export function worldYForScrollY(scrollY: number): number {
  if (!measured) return 0;
  if (scrollY <= offsets[0]) return sectionWorldY(0);
  for (let i = 0; i < offsets.length - 1; i++) {
    const a = offsets[i];
    const b = offsets[i + 1];
    if (scrollY >= a && scrollY <= b) {
      const t = b > a ? (scrollY - a) / (b - a) : 0;
      return sectionWorldY(i) + (sectionWorldY(i + 1) - sectionWorldY(i)) * t;
    }
  }
  return sectionWorldY(offsets.length - 1);
}
