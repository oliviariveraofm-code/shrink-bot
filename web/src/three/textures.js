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

// A tall, soft-edged vertical cone used as the volumetric god-ray falling
// from the vault down onto the figure.
export function createShaftTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 512;
  const ctx = c.getContext("2d");
  const vg = ctx.createLinearGradient(0, 0, 0, c.height);
  vg.addColorStop(0, "rgba(210,230,245,0.9)");
  vg.addColorStop(0.6, "rgba(180,210,235,0.35)");
  vg.addColorStop(1, "rgba(160,195,225,0)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, c.width, c.height);

  const hg = ctx.createLinearGradient(0, 0, c.width, 0);
  hg.addColorStop(0, "rgba(0,0,0,1)");
  hg.addColorStop(0.42, "rgba(0,0,0,0)");
  hg.addColorStop(0.58, "rgba(0,0,0,0)");
  hg.addColorStop(1, "rgba(0,0,0,1)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, c.width, c.height);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Faint embedded circuit/city-light pattern for a few column faces.
export function createCircuitTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "rgba(90,150,190,0.35)";
  ctx.lineWidth = 1;
  const cols = 4;
  for (let i = 0; i <= cols; i++) {
    const x = (i / cols) * c.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, c.height);
    ctx.stroke();
  }
  let y = 8;
  while (y < c.height) {
    if (Math.random() > 0.4) {
      const x0 = Math.floor(Math.random() * cols) * (c.width / cols);
      const w = (c.width / cols) * (1 + Math.floor(Math.random() * 2));
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + w, y);
      ctx.stroke();
    }
    y += 10 + Math.random() * 22;
  }
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * c.width;
    const yy = Math.random() * c.height;
    ctx.fillStyle = `rgba(120,190,230,${0.2 + Math.random() * 0.5})`;
    ctx.fillRect(x, yy, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
