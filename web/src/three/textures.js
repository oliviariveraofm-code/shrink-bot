import * as THREE from "three";

// Vertical soft-edged gradient used for the diagnostic-blue light beams.
export function createBeamTexture() {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 512;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, "rgba(79,184,255,0)");
  g.addColorStop(0.12, "rgba(79,184,255,0.55)");
  g.addColorStop(0.5, "rgba(120,205,255,0.9)");
  g.addColorStop(0.88, "rgba(79,184,255,0.55)");
  g.addColorStop(1, "rgba(79,184,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);

  // soft horizontal falloff so the beam isn't a hard-edged rectangle
  const hg = ctx.createLinearGradient(0, 0, c.width, 0);
  hg.addColorStop(0, "rgba(0,0,0,1)");
  hg.addColorStop(0.35, "rgba(0,0,0,0)");
  hg.addColorStop(0.65, "rgba(0,0,0,0)");
  hg.addColorStop(1, "rgba(0,0,0,1)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, c.width, c.height);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Soft radial glow used for the ceiling oculus and floor podium glow.
export function createGlowTexture(hex = "#eef1f4") {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, hex);
  g.addColorStop(0.35, hex);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
