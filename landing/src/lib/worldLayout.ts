export const SECTION_IDS = [
  "hero",
  "agents",
  "shrink",
  "sessions",
  "rules",
  "pricing",
  "propfirms",
  "footer",
] as const;

export const SECTION_SPACING = 15;

export function sectionWorldY(index: number) {
  return -index * SECTION_SPACING;
}

export const TOTAL_WORLD_HEIGHT = (SECTION_IDS.length - 1) * SECTION_SPACING + 10;

export const WORLD_Y = {
  hero: sectionWorldY(0),
  agents: sectionWorldY(1),
  shrink: sectionWorldY(2),
  sessions: sectionWorldY(3),
  rules: sectionWorldY(4),
  pricing: sectionWorldY(5),
  propfirms: sectionWorldY(6),
  footer: sectionWorldY(7),
};
