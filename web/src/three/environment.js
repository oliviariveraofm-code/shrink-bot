import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { createBeamTexture, createGlowTexture } from "./textures.js";

const STONE = 0x111214;
const STONE_DARK = 0x08090a;

export function createEnvironment(scene) {
  scene.fog = new THREE.FogExp2(0x05060a, 0.034);

  // ---------------------------------------------------------------- floor
  const floorGeo = new THREE.CircleGeometry(14, 64);
  const reflector = new Reflector(floorGeo, {
    color: 0x0c0d10,
    textureWidth: 1024,
    textureHeight: 1024,
    clipBias: 0.003,
  });
  reflector.rotation.x = -Math.PI / 2;
  reflector.position.y = 0;
  scene.add(reflector);

  // matte scrim over the reflector so it reads as honed stone, not a mirror
  const scrim = new THREE.Mesh(
    floorGeo,
    new THREE.MeshBasicMaterial({ color: 0x05060a, transparent: true, opacity: 0.72 })
  );
  scrim.rotation.x = -Math.PI / 2;
  scrim.position.y = 0.001;
  scene.add(scrim);

  // podium ring beneath the figure
  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(0.82, 0.9, 0.06, 64),
    new THREE.MeshPhysicalMaterial({ color: STONE, roughness: 0.5, clearcoat: 0.3 })
  );
  podium.position.y = 0.03;
  scene.add(podium);

  const podiumRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.007, 12, 96),
    new THREE.MeshBasicMaterial({ color: 0x4fb8ff })
  );
  podiumRing.rotation.x = Math.PI / 2;
  podiumRing.position.y = 0.065;
  scene.add(podiumRing);

  const podiumGlow = new THREE.PointLight(0x4fb8ff, 0.6, 4, 2);
  podiumGlow.position.y = 0.1;
  scene.add(podiumGlow);

  // ------------------------------------------------------------- columns
  const columnMat = new THREE.MeshStandardMaterial({
    color: 0x2c2f34,
    roughness: 0.5,
    metalness: 0.3,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbfd8e8,
    roughness: 0.5,
    metalness: 0,
    transparent: true,
    opacity: 0.22,
    emissive: 0x4fb8ff,
    emissiveIntensity: 0.15,
  });

  const uplightMat = new THREE.MeshBasicMaterial({ color: 0x1c3a4a });

  const columnGroup = new THREE.Group();
  const rows = 6;
  const spacingZ = -3.4;
  const sideX = 3.1;
  for (let i = 0; i < rows; i++) {
    const z = -2 - i * Math.abs(spacingZ);
    for (const side of [-1, 1]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.4, 0.5), columnMat);
      col.position.set(side * sideX, 2.2, z);
      columnGroup.add(col);

      const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 3.6), glassMat);
      glass.position.set(side * (sideX - 0.26), 2.2, z);
      glass.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      columnGroup.add(glass);

      // architectural cove uplight at the base of each column, echoing the
      // gallery-lighting practicals in the concept art
      const cove = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 24), uplightMat);
      cove.position.set(side * sideX, 0.02, z);
      columnGroup.add(cove);

      const uplight = new THREE.PointLight(0x6fb8dd, 3.5, 3.2, 2);
      uplight.position.set(side * sideX, 0.35, z);
      columnGroup.add(uplight);
    }
  }
  scene.add(columnGroup);

  // -------------------------------------------------------- light beams
  const beamTex = createBeamTexture();
  const beamMat = new THREE.MeshBasicMaterial({
    map: beamTex,
    color: 0x4fb8ff,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const beams = [];
  for (let i = 0; i < rows; i++) {
    const z = -2.6 - i * Math.abs(spacingZ);
    for (const side of [-1, 1]) {
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 5.2), beamMat.clone());
      beam.position.set(side * (sideX - 0.9), 2.3, z);
      beam.userData.phase = Math.random() * Math.PI * 2;
      beams.push(beam);
      columnGroup.add(beam);
    }
  }

  // -------------------------------------------------------------- oculus
  const glowTex = createGlowTexture("#eef1f4");
  const oculus = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xeef1f4,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  oculus.scale.set(3.2, 3.2, 1);
  oculus.position.set(0, 4.6, -0.6);
  scene.add(oculus);

  const oculusRing = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 0.95, 64),
    new THREE.MeshBasicMaterial({ color: 0x2a2d31, side: THREE.DoubleSide })
  );
  oculusRing.rotation.x = Math.PI / 2;
  oculusRing.position.set(0, 4.55, -0.6);
  scene.add(oculusRing);

  // -------------------------------------------------------------- lights
  // Note: point/spot light intensity is in candela (physically-based), so
  // values need to scale with distance-squared — small numbers read as
  // near-black at a few metres out.
  const hemi = new THREE.HemisphereLight(0x3a4652, 0x050506, 0.9);
  scene.add(hemi);

  // Distance-independent wash so the columns read down the full length of
  // the corridor — point lights alone fall off far too fast over ~20 units.
  const corridorWash = new THREE.DirectionalLight(0x8fb4d0, 0.55);
  corridorWash.position.set(2, 6, 4);
  corridorWash.target.position.set(0, 1, -14);
  scene.add(corridorWash, corridorWash.target);

  const key = new THREE.SpotLight(0xf4f6f8, 90, 16, Math.PI / 6, 0.65, 2);
  key.position.set(0.6, 5.5, 2.4);
  key.target.position.set(0, 1.4, 0);
  scene.add(key, key.target);

  const rim = new THREE.PointLight(0x4fb8ff, 9, 8, 2);
  rim.position.set(0, 1.8, -1.4);
  scene.add(rim);

  const fill = new THREE.PointLight(0x8fa3ad, 14, 10, 2);
  fill.position.set(-2.4, 1.8, 4);
  scene.add(fill);

  const floorFill = new THREE.PointLight(0x8fa3ad, 8, 10, 2);
  floorFill.position.set(0, 0.6, 5);
  scene.add(floorFill);

  return {
    update(t) {
      beams.forEach((b) => {
        b.material.opacity = 0.35 + Math.sin(t * 0.5 + b.userData.phase) * 0.12;
      });
      podiumGlow.intensity = 0.7 + Math.sin(t * 0.8) * 0.15;
      oculus.material.opacity = 0.5 + Math.sin(t * 0.3) * 0.06;
    },
  };
}
