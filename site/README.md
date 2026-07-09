# The Trading Floor

Single-page marketing site for The Trading Floor — a multi-agent AI trading
analysis platform built around the twelve agents (including The Shrink)
implemented in the root-level Discord bot.

## Stack

- React 18 + Vite
- Three.js via React Three Fiber + Drei
- `@react-three/postprocessing` for bloom / depth-of-field / vignette
- GSAP for scroll-triggered entrances
- Lenis for smooth scrolling
- Tailwind CSS v4

## Development

```bash
npm install
npm run dev      # dev server
npm run build    # production build to dist/
npm run lint     # oxlint
```

## Structure

- `src/three/` — raw Three.js/R3F scene components (galaxy, hex logo, psych
  core, timeline)
- `src/components/` — sections and DOM UI (each heavy 3D section lazily
  mounts its own `<Canvas>` once scrolled into view)
- `src/data/` — content data (agents, rules, sessions, prop firm rules)
- `src/hooks/` — scroll progress, device-tier detection, magnetic buttons

Particle counts and post-processing complexity scale down automatically on
mobile/low-power devices via `useDeviceTier`.
