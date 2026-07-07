import * as THREE from "three";

/*
 * Placeholder textures. Each one is drawn on a <canvas> so the hero scene
 * looks finished with zero assets checked in. The moment a matching file
 * shows up in landing/assets/ (see assets/README.md for exact names), the
 * loader below swaps the real image in automatically — nothing else to wire.
 */

function baseCanvas() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0b0b0d";
  ctx.fillRect(0, 0, size, size);
  return { canvas, ctx, size };
}

function frame(ctx, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, size - 10, size - 10);
}

// Placeholder 1: candlestick chart
function drawCandlesticks() {
  const { canvas, ctx, size } = baseCanvas();
  const cols = 22;
  const colW = size / cols;
  let price = size * 0.55;

  for (let i = 0; i < cols; i++) {
    const open = price;
    const drift = (Math.random() - 0.48) * size * 0.09;
    const close = Math.max(size * 0.12, Math.min(size * 0.85, open + drift));
    const high = Math.max(open, close) + Math.random() * size * 0.03;
    const low = Math.min(open, close) - Math.random() * size * 0.03;
    const up = close < open; // canvas y grows downward
    const color = up ? "#29ff8c" : "#ff2d3d";
    const x = i * colW + colW * 0.5;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, high);
    ctx.lineTo(x, low);
    ctx.stroke();

    ctx.fillStyle = color;
    const bodyTop = Math.min(open, close);
    const bodyH = Math.max(6, Math.abs(close - open));
    ctx.fillRect(x - colW * 0.28, bodyTop, colW * 0.56, bodyH);

    price = close;
  }
  frame(ctx, size, "#ff2d3d");
  return canvas;
}

// Placeholder 2: P&L line / equity curve
function drawEquityCurve() {
  const { canvas, ctx, size } = baseCanvas();
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "rgba(41,255,140,0.35)");
  grad.addColorStop(1, "rgba(41,255,140,0)");

  const points = [];
  let y = size * 0.7;
  for (let x = 0; x <= size; x += size / 40) {
    y += (Math.random() - 0.45) * 40;
    y = Math.max(size * 0.15, Math.min(size * 0.85, y));
    points.push([x, y]);
  }

  ctx.beginPath();
  ctx.moveTo(0, size);
  points.forEach(([x, py]) => ctx.lineTo(x, py));
  ctx.lineTo(size, size);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  points.forEach(([x, py]) => ctx.lineTo(x, py));
  ctx.strokeStyle = "#29ff8c";
  ctx.lineWidth = 6;
  ctx.stroke();

  frame(ctx, size, "#29ff8c");
  return canvas;
}

// Placeholder 3: agent glyph / emblem
function drawAgentGlyph() {
  const { canvas, ctx, size } = baseCanvas();
  const cx = size / 2;
  const cy = size / 2;

  for (let r = size * 0.38; r > size * 0.1; r -= size * 0.09) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,45,61,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.font = `700 ${size * 0.16}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = "#d8d8d4";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("05", cx, cy);

  ctx.font = `500 ${size * 0.04}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = "#ff2d3d";
  ctx.fillText("THE SHRINK", cx, cy + size * 0.28);

  frame(ctx, size, "#ff2d3d");
  return canvas;
}

const FALLBACKS = [drawCandlesticks, drawEquityCurve, drawAgentGlyph];

export function loadPlaneTexture(index, loader) {
  return new Promise((resolve) => {
    const path = `assets/image-${index + 1}.jpg`;
    loader.load(
      path,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      },
      undefined,
      () => {
        const canvas = FALLBACKS[index % FALLBACKS.length]();
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      }
    );
  });
}
