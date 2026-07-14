import * as THREE from "three";

// Builds the procedural figure of "The Shrink": a still, robed silhouette
// with a glowing vertical eye-line and a slowly rotating halo behind the head.
export function createShrink() {
  const group = new THREE.Group();
  group.name = "shrink";

  const ceramicWhite = new THREE.MeshPhysicalMaterial({
    color: 0xeef1f4,
    roughness: 0.32,
    metalness: 0.05,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
  });

  const onyxFabric = new THREE.MeshPhysicalMaterial({
    color: 0x0d0e10,
    roughness: 0.7,
    metalness: 0.08,
    clearcoat: 0.1,
  });

  const stoneCloak = new THREE.MeshPhysicalMaterial({
    color: 0xaeb2b8,
    roughness: 0.55,
    metalness: 0.04,
    clearcoat: 0.25,
    clearcoatRoughness: 0.4,
    side: THREE.DoubleSide,
  });

  // --- Head -----------------------------------------------------------
  const head = new THREE.Group();
  head.position.y = 1.66;

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.165, 32, 32), ceramicWhite);
  skull.scale.set(0.8, 1.22, 0.94);
  head.add(skull);

  const jaw = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.16, 24, 1, true), ceramicWhite);
  jaw.position.set(0, -0.155, 0.015);
  jaw.rotation.x = Math.PI;
  head.add(jaw);

  // vertical glowing eye-line ("the eyes" motif)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x4fb8ff });
  const eye = new THREE.Mesh(new THREE.PlaneGeometry(0.013, 0.18), eyeMat);
  eye.position.set(0, 0.02, 0.152);
  head.add(eye);
  const eyeGlow = new THREE.PointLight(0x4fb8ff, 0.16, 0.9, 2);
  eyeGlow.position.set(0, 0.02, 0.22);
  head.add(eyeGlow);

  group.add(head);

  // --- Neck ---------------------------------------------------------------
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.14, 20), ceramicWhite);
  neck.position.y = 1.5;
  group.add(neck);

  // --- Draped cloak body, lathed for a soft fabric silhouette -------------
  const profile = [
    [0.02, 0.0],
    [0.46, 0.0],
    [0.445, 0.04],
    [0.42, 0.3],
    [0.39, 0.65],
    [0.365, 1.0],
    [0.35, 1.25],
    [0.35, 1.36],
    [0.32, 1.42],
    [0.22, 1.47],
    [0.13, 1.5],
  ].map(([r, y]) => new THREE.Vector2(r, y));

  const cloak = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), stoneCloak);
  group.add(cloak);

  // subtle centre seam suggesting where the robe closes
  const seam = new THREE.Mesh(
    new THREE.PlaneGeometry(0.012, 1.3),
    new THREE.MeshPhysicalMaterial({ color: 0x6d7076, roughness: 0.7 })
  );
  seam.position.set(0, 0.72, 0.4);
  group.add(seam);

  // dark under-robe glimpsed at the collar
  const underRobe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.16, 0.12, 20, 1, true),
    onyxFabric
  );
  underRobe.position.y = 1.46;
  group.add(underRobe);

  // shoulder ridge to break the cone into "shoulders + drape"
  const shoulderLine = new THREE.Mesh(
    new THREE.TorusGeometry(0.335, 0.009, 10, 48),
    stoneCloak
  );
  shoulderLine.rotation.x = Math.PI / 2;
  shoulderLine.position.y = 1.4;
  group.add(shoulderLine);

  // titanium waist band — a quiet nod to the engineered/mechanical brief
  const titanium = new THREE.MeshPhysicalMaterial({
    color: 0xc7ccd2,
    roughness: 0.3,
    metalness: 0.85,
  });
  const waistBand = new THREE.Mesh(new THREE.TorusGeometry(0.375, 0.01, 10, 48), titanium);
  waistBand.rotation.x = Math.PI / 2;
  waistBand.position.y = 0.92;
  group.add(waistBand);

  // flanking seams for a touch of vertical rhythm
  for (const side of [-1, 1]) {
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(0.008, 1.0),
      new THREE.MeshPhysicalMaterial({ color: 0x8a8e94, roughness: 0.7 })
    );
    s.position.set(side * 0.3, 0.65, 0.28);
    s.rotation.y = side * 0.5;
    group.add(s);
  }

  // --- Popped collar behind the neck ---------------------------------------
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.028, 12, 32, Math.PI * 1.3),
    stoneCloak
  );
  collar.rotation.x = Math.PI / 2;
  collar.rotation.z = Math.PI * 0.85;
  collar.position.y = 1.52;
  group.add(collar);

  // --- Base hem / floor contact -------------------------------------------
  const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.64, 0.03, 48), stoneCloak);
  hem.position.y = 0.015;
  group.add(hem);

  // --- Halo ring ------------------------------------------------------------
  const halo = new THREE.Group();
  halo.position.set(0, 1.78, -0.24);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.007, 16, 96),
    new THREE.MeshBasicMaterial({ color: 0xeef1f4 })
  );
  halo.add(ring);
  const haloGlow = new THREE.PointLight(0xeef1f4, 0.14, 1.6, 2);
  halo.add(haloGlow);
  group.add(halo);

  return {
    group,
    update(t) {
      // near-stillness: only a breath-scale idle motion, nothing that reads as "animated"
      const breathe = Math.sin(t * 0.6) * 0.004;
      group.position.y = breathe;

      const sway = Math.sin(t * 0.35) * 0.006;
      head.rotation.z = sway;
      head.rotation.y = Math.sin(t * 0.22) * 0.01;

      halo.rotation.z = t * 0.08;
      halo.rotation.y = t * 0.05;

      const flicker = 0.85 + Math.sin(t * 3.1) * 0.08 + Math.sin(t * 7.3) * 0.05;
      eyeGlow.intensity = 0.16 * flicker;
    },
  };
}
