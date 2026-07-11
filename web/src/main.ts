import './style.css'
import { initHeroScene } from './hero-scene.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <section class="hero">
    <div class="hero-canvas-wrap" id="hero-canvas-wrap"></div>
    <div class="hero-content">
      <p class="hero-eyebrow">The Trading Floor</p>
      <h1 class="hero-headline">Your desk, run by an AI trading floor.</h1>
      <p class="hero-subtext">
        Placeholder subtext — a short line about what The Trading Floor does
        and why it matters, refined later.
      </p>
      <button class="hero-cta" type="button">Get started</button>
    </div>
  </section>
`

const canvasWrap = document.querySelector<HTMLDivElement>('#hero-canvas-wrap')!
initHeroScene(canvasWrap)
