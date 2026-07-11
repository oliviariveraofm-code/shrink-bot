import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import fs from "fs";

// GLTFExporter's binary path uses the browser FileReader API to turn
// Blobs into data URLs — polyfill the one method it needs so this can
// run under plain Node for generating a local test fixture.
globalThis.FileReader = class {
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      const base64 = Buffer.from(buf).toString("base64");
      this.result = `data:${blob.type || "application/octet-stream"};base64,${base64}`;
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
};

// Rough head-proportioned low-poly placeholder (not a real face — just
// enough distinct geometry/normals to exercise the GLTFLoader -> material
// restyle -> GSAP motion pipeline before a real Sketchfab asset is wired in).
const geo = new THREE.IcosahedronGeometry(1, 1);
const pos = geo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const y = pos.getY(i);
  pos.setX(i, pos.getX(i) * 0.85);
  pos.setZ(i, pos.getZ(i) * (pos.getZ(i) > 0 ? 0.9 : 0.6));
  if (y < -0.2) pos.setY(i, y * 1.1);
}
geo.computeVertexNormals();

const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x888888 }));
mesh.name = "PlaceholderHead";

const scene = new THREE.Scene();
scene.add(mesh);

const exporter = new GLTFExporter();
const result = await new Promise((resolve, reject) => {
  exporter.parse(scene, resolve, reject, { binary: true });
});
fs.writeFileSync("public/test-placeholder-head.glb", Buffer.from(result));
console.log("wrote glb:", result.byteLength, "bytes");
