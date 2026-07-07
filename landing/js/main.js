import * as THREE from "three";
import { loadPlaneTexture } from "./textures.js";
import { buildTicker } from "./ticker.js";

const tickerTrack = document.getElementById("ticker-track");
if (tickerTrack) buildTicker(tickerTrack);

const canvas = document.getElementById("hero-canvas");
const hero = document.querySelector(".hero");

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030303, 0.045);

const camera = new THREE.PerspectiveCamera(
  50,
  hero.clientWidth / hero.clientHeight,
  0.1,
  100
);
camera.position.set(0, 0.6, 9);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(hero.clientWidth, hero.clientHeight);
renderer.setClearColor(0x000000, 0);

// ---------- lighting ----------

scene.add(new THREE.AmbientLight(0x66666a, 0.9));

const redLight = new THREE.PointLight(0xff2d3d, 18, 20);
redLight.position.set(-4, 2, 3);
scene.add(redLight);

const greenLight = new THREE.PointLight(0x29ff8c, 18, 20);
greenLight.position.set(4, -2, 3);
scene.add(greenLight);

// ---------- starfield ----------

function buildStarfield() {
  const count = 900;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x555560,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
  });
  return new THREE.Points(geo, mat);
}
scene.add(buildStarfield());

// ---------- pulsing core ----------

const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.1, 1),
  new THREE.MeshBasicMaterial({
    color: 0xff2d3d,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  })
);
scene.add(core);

// ---------- orbiting planes ----------

const orbitGroup = new THREE.Group();
scene.add(orbitGroup);

const PLANE_COUNT = 3;
const planes = [];
const loader = new THREE.TextureLoader();

const orbitConfig = [
  { radius: 3.4, speed: 0.22, tilt: 0.15, phase: 0 },
  { radius: 4.3, speed: -0.16, tilt: -0.25, phase: (Math.PI * 2) / 3 },
  { radius: 3.8, speed: 0.19, tilt: 0.3, phase: (Math.PI * 4) / 3 },
];

for (let i = 0; i < PLANE_COUNT; i++) {
  const cfg = orbitConfig[i];
  const geo = new THREE.PlaneGeometry(2.1, 2.6);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 2.8),
    new THREE.MeshBasicMaterial({
      color: i === 1 ? 0x29ff8c : 0xff2d3d,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    })
  );
  glow.position.z = -0.02;

  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geo, mat);

  const holder = new THREE.Group();
  holder.add(glow);
  holder.add(plane);

  holder.userData = { ...cfg, index: i };
  orbitGroup.add(holder);
  planes.push(holder);

  loadPlaneTexture(i, loader).then((tex) => {
    mat.map = tex;
    mat.needsUpdate = true;
  });
}

// ---------- mouse parallax ----------

const pointer = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
});

// ---------- resize ----------

function onResize() {
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", onResize);

// ---------- animation loop ----------

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  core.rotation.x = t * 0.15;
  core.rotation.y = t * 0.22;
  core.scale.setScalar(1 + Math.sin(t * 1.4) * 0.05);

  planes.forEach((holder) => {
    const { radius, speed, tilt, phase, index } = holder.userData;
    const angle = t * speed + phase;
    holder.position.set(
      Math.cos(angle) * radius,
      Math.sin(t * 0.6 + index) * 0.4 + Math.sin(angle * 0.5) * tilt,
      Math.sin(angle) * radius * 0.6
    );
    holder.lookAt(camera.position);
    holder.rotation.z = Math.sin(t * 0.3 + index) * 0.08;
  });

  orbitGroup.rotation.y = t * 0.05;

  camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.03;
  camera.position.y += (0.6 - pointer.y * 0.6 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  redLight.intensity = 14 + Math.sin(t * 1.8) * 6;
  greenLight.intensity = 14 + Math.cos(t * 1.5) * 6;

  renderer.render(scene, camera);
}
animate();
