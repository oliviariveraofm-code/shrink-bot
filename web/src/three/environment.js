import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import {
  createBeamTexture,
  createGlowTexture,
  createShaftTexture,
  createCircuitTexture,
} from "./textures.js";

const STONE = 0x111214;

export function createEnvironment(scene) {
  scene.fog = new THREE.FogExp2(0x030405, 0.021);

  // ---------------------------------------------------------------- floor
  const floorGeo = new THREE.CircleGeometry(7, 64);
  const reflector = new Reflector(floorGeo, {
    color: 0x11151a,
    textureWidth: 1024,
    textureHeight: 1024,
    clipBias: 0.003,
  });
  reflector.rotation.x = -Math.PI / 2;
  reflector.position.y = 0;
  scene.add(reflector);

  // matte scrim over the reflector — clearer than pure mirror, still honed stone
  const scrim = new THREE.Mesh(
    floorGeo,
    new THREE.MeshBasicMaterial({ color: 0x020304, transparent: true, opacity: 0.68 })
  );
  scrim.rotation.x = -Math.PI / 2;
  scrim.position.y = 0.001;
  scene.add(scrim);

  // concentric ritual/scan rings glowing faintly around the podium
  const ringGroup = new THREE.Group();
  [1.3, 1.9, 2.6].forEach((r, i) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r, r + 0.006, 96),
      new THREE.MeshBasicMaterial({
        color: 0x4fb8ff,
        transparent: true,
        opacity: 0.16 - i * 0.03,
        side: THREE.DoubleSide,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.004;
    ringGroup.add(ring);
  });
  scene.add(ringGroup);

  // podium
  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(0.82, 0.9, 0.06, 64),
    new THREE.MeshPhysicalMaterial({ color: STONE, roughness: 0.5, clearcoat: 0.3 })
  );
  podium.position.y = 0.03;
  scene.add(podium);

  const podiumRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.006, 12, 96),
    new THREE.MeshBasicMaterial({ color: 0x4fb8ff })
  );
  podiumRing.rotation.x = Math.PI / 2;
  podiumRing.position.y = 0.065;
  scene.add(podiumRing);

  const podiumGlow = new THREE.PointLight(0x4fb8ff, 0.5, 4, 2);
  podiumGlow.position.y = 0.1;
  scene.add(podiumGlow);

  // ------------------------------------------------------------- columns
  const circuitTex = createCircuitTexture();
  const columnMat = new THREE.MeshStandardMaterial({
    color: 0x2a2d33,
    roughness: 0.4,
    metalness: 0.4,
  });
  const circuitMat = new THREE.MeshStandardMaterial({
    color: 0x14161a,
    roughness: 0.5,
    metalness: 0.2,
    emissive: 0x1c3a4a,
    emissiveMap: circuitTex,
    emissiveIntensity: 0.9,
  });

  const uplightMat = new THREE.MeshBasicMaterial({ color: 0x1c3a4a });

  const columnGroup = new THREE.Group();
  const rows = 7;
  const spacingZ = -3.2;
  const sideX = 3.3;
  const colHeight = 10;
  for (let i = 0; i < rows; i++) {
    const z = -2.2 - i * Math.abs(spacingZ);
    for (const side of [-1, 1]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.6, colHeight, 0.6), columnMat);
      col.position.set(side * sideX, colHeight / 2 - 0.4, z);
      columnGroup.add(col);

      // faint circuit-etched face looking down the corridor
      if (i % 2 === 0) {
        const face = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 4.2), circuitMat);
        face.position.set(side * (sideX - 0.301), 2.4, z);
        face.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
        columnGroup.add(face);
      }

      // architectural cove uplight at the base of each column
      const cove = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.02, 24), uplightMat);
      cove.position.set(side * sideX, 0.02, z);
      columnGroup.add(cove);

      const uplight = new THREE.PointLight(0x6fb8dd, 2.6, 3, 2);
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
    const z = -2.8 - i * Math.abs(spacingZ);
    for (const side of [-1, 1]) {
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 6.5), beamMat.clone());
      beam.material.opacity = 0.18;
      beam.position.set(side * (sideX - 0.85), 3, z);
      beam.userData.phase = Math.random() * Math.PI * 2;
      beams.push(beam);
      columnGroup.add(beam);
    }
  }

  // ---------------------------------------------------------- rocks
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x0c0d0e, roughness: 0.95 });
  function makeRock(scale, pos) {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const pos_ = geo.attributes.position;
    for (let i = 0; i < pos_.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos_, i);
      const n = 0.18 * Math.sin(v.x * 3 + v.y * 5) + 0.12 * Math.cos(v.z * 4 - v.y * 2);
      v.addScaledVector(v.clone().normalize(), n);
      pos_.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const rock = new THREE.Mesh(geo, rockMat);
    rock.scale.set(scale.x, scale.y, scale.z);
    rock.position.set(pos.x, pos.y, pos.z);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    return rock;
  }
  scene.add(makeRock({ x: 1.1, y: 0.7, z: 1.0 }, { x: -4.6, y: 0.15, z: 6.2 }));
  scene.add(makeRock({ x: 0.7, y: 0.5, z: 0.6 }, { x: -5.4, y: 0.05, z: 7.4 }));
  scene.add(makeRock({ x: 1.2, y: 0.75, z: 1.05 }, { x: 4.7, y: 0.15, z: 6.4 }));
  scene.add(makeRock({ x: 0.65, y: 0.45, z: 0.55 }, { x: 5.6, y: 0.05, z: 7.5 }));

  // -------------------------------------------------------- vaulted arch
  // The dominant background element: a rounded vault frame with an emissive
  // ring nested inside it, aligned behind the character's own halo.
  const archGroup = new THREE.Group();
  const archZ = -15;
  const archMat = new THREE.MeshStandardMaterial({
    color: 0x0a0b0c,
    roughness: 0.6,
    metalness: 0.15,
  });
  const archFrame = new THREE.Mesh(
    new THREE.TorusGeometry(2.6, 0.34, 20, 64, Math.PI),
    archMat
  );
  archFrame.position.set(0, 2.9, archZ);
  archGroup.add(archFrame);

  // support legs grounding the arch into a proper doorway rather than a
  // floating horseshoe
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.9, 0.68), archMat);
    leg.position.set(side * 2.6, 1.45, archZ);
    archGroup.add(leg);
  }

  const archRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.045, 20, 96),
    new THREE.MeshBasicMaterial({ color: 0xf4f7fa })
  );
  archRing.position.set(0, 3.55, archZ + 2.6);
  archGroup.add(archRing);
  const archRingGlow = new THREE.PointLight(0xdfeeff, 6, 9, 2);
  archRingGlow.position.copy(archRing.position);
  archGroup.add(archRingGlow);
  scene.add(archGroup);

  // volumetric light shaft — kept close to the figure (rather than spanning
  // the full distance to the vault) so perspective + fog sell the connection
  // in screen space without a plane physically bridging 15 units of depth.
  const shaftTex = createShaftTexture();
  const shaft = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 9),
    new THREE.MeshBasicMaterial({
      map: shaftTex,
      color: 0xdcebfa,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  shaft.position.set(0, 3.6, -1.2);
  const shaftCross = shaft.clone();
  shaftCross.rotation.y = Math.PI / 2;
  scene.add(shaft, shaftCross);

  // -------------------------------------------------------------- lights
  // Note: point/spot light intensity is in candela (physically-based), so
  // values need to scale with distance-squared — small numbers read as
  // near-black at a few metres out.
  const hemi = new THREE.HemisphereLight(0x2e3a44, 0x020203, 0.85);
  scene.add(hemi);

  const corridorWash = new THREE.DirectionalLight(0x7fa0b8, 0.75);
  corridorWash.position.set(2, 6, 4);
  corridorWash.target.position.set(0, 1, -18);
  scene.add(corridorWash, corridorWash.target);

  // grazing side light so the nearest column faces catch a visible highlight
  const grazeL = new THREE.DirectionalLight(0x9fc4e0, 0.6);
  grazeL.position.set(8, 3, 6);
  grazeL.target.position.set(-3, 2, -10);
  scene.add(grazeL, grazeL.target);

  const grazeR = new THREE.DirectionalLight(0x9fc4e0, 0.6);
  grazeR.position.set(-8, 3, 6);
  grazeR.target.position.set(3, 2, -10);
  scene.add(grazeR, grazeR.target);

  const key = new THREE.SpotLight(0xeaf2f8, 140, 20, Math.PI / 9, 0.5, 1.6);
  key.position.set(0, 8, -4);
  key.target.position.set(0, 1.5, 0);
  scene.add(key, key.target);

  const rim = new THREE.PointLight(0x4fb8ff, 5, 8, 2);
  rim.position.set(0, 1.8, -1.6);
  scene.add(rim);

  const fill = new THREE.PointLight(0x76899a, 8, 10, 2);
  fill.position.set(-2.4, 1.8, 4);
  scene.add(fill);

  return {
    update(t) {
      beams.forEach((b) => {
        b.material.opacity = 0.14 + Math.sin(t * 0.5 + b.userData.phase) * 0.06;
      });
      podiumGlow.intensity = 0.45 + Math.sin(t * 0.8) * 0.1;
      shaft.material.opacity = 0.14 + Math.sin(t * 0.25) * 0.03;
      shaftCross.material.opacity = shaft.material.opacity;
      archRingGlow.intensity = 5.5 + Math.sin(t * 0.6) * 0.8;
    },
  };
}
