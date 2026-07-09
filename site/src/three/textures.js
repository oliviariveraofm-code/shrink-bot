import * as THREE from "three";

const cache = new Map();

// Soft radial-gradient sprite used for glowing points / nebula volumes.
// Cached by color so repeated calls (per particle system) don't regenerate canvases.
export function radialTexture(color = "#ffffff", key = color) {
  if (cache.has(key)) return cache.get(key);

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `${color}ff`);
  gradient.addColorStop(0.25, `${color}cc`);
  gradient.addColorStop(0.6, `${color}33`);
  gradient.addColorStop(1, `${color}00`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  cache.set(key, texture);
  return texture;
}
