# The Trading Floor — Landing Page

A single-page React + Three.js landing site for The Trading Floor, a multi-agent
AI trading analysis platform. Dark theme, gold/teal neon accents, and a
persistent WebGL background (particle field, wireframe "Shrink" brain, orbiting
agent ring) that stays alive behind every section as you scroll.

## Stack

- React 19 + TypeScript + Vite
- `@react-three/fiber` / `@react-three/drei` / `@react-three/postprocessing` for the 3D scene
- GSAP + ScrollTrigger for section reveal animations
- Lenis for smooth scrolling

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run preview  # serve the production build locally
```

## Structure

- `src/three/` — the persistent WebGL scene (particle field, hero hex-logo intro,
  the Shrink brain, agent ring, camera rig, postprocessing).
- `src/components/` — DOM sections (Hero, Agents, Shrink, Sessions, Rules,
  Pricing, Prop Firms, Nav, Login modal, Footer) and their styles.
- `src/lib/` — scroll state store, Lenis wiring, intro-phase state, and the
  scroll-position → 3D-world-Y mapping that keeps the camera in sync with the
  actual DOM section layout.

Particle count and shader complexity automatically reduce on narrow
viewports (< 820px) to keep frame rate up on mobile.
