import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { createEnvironment } from "./environment.js";
import { createShrink } from "./shrink.js";

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export class HeroScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.startTime = performance.now();
    this.pointer = { x: 0, y: 0 };
    this.targetPointer = { x: 0, y: 0 };

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      23,
      window.innerWidth / window.innerHeight,
      0.1,
      60
    );
    this.basePosition = new THREE.Vector3(0, 2.3, 17);
    this.lookTarget = new THREE.Vector3(0, 1.2, 0);
    this.camera.position.copy(this.basePosition);
    this.camera.lookAt(this.lookTarget);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.environment = createEnvironment(this.scene);
    this.shrink = createShrink();
    this.scene.add(this.shrink.group);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.42,
      0.4,
      0.82
    );
    this.composer.addPass(this.bloom);

    this._onResize = this.resize.bind(this);
    window.addEventListener("resize", this._onResize);

    if (!REDUCED_MOTION) {
      this._onPointerMove = (e) => {
        this.targetPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetPointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", this._onPointerMove);
    }

    this._visible = true;
    document.addEventListener("visibilitychange", () => {
      this._visible = document.visibilityState === "visible";
    });

    this.resize();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }

  updateCamera(t) {
    const p = this.basePosition;

    if (REDUCED_MOTION) {
      this.camera.position.copy(p);
      this.camera.lookAt(this.lookTarget);
      return;
    }

    // Extremely slow, layered drift — never a fast or obvious pan.
    const driftX = Math.sin(t * 0.045) * 0.5 + Math.sin(t * 0.021) * 0.22;
    const driftY = Math.sin(t * 0.03) * 0.14;
    const driftZ = Math.sin(t * 0.018) * 0.6;

    this.pointer.x += (this.targetPointer.x - this.pointer.x) * 0.015;
    this.pointer.y += (this.targetPointer.y - this.pointer.y) * 0.015;

    this.camera.position.set(
      p.x + driftX + this.pointer.x * 0.12,
      p.y + driftY - this.pointer.y * 0.05,
      p.z + driftZ
    );

    const lookX = this.lookTarget.x + Math.sin(t * 0.02) * 0.2;
    const lookY = this.lookTarget.y + Math.sin(t * 0.026) * 0.06;
    this.camera.lookAt(lookX, lookY, this.lookTarget.z);
  }

  start() {
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      if (!this._visible) return;

      const t = REDUCED_MOTION ? 0 : (performance.now() - this.startTime) / 1000;
      this.updateCamera(t);
      this.shrink.update(t);
      this.environment.update(t);

      this.composer.render();
    };
    this._raf = requestAnimationFrame(loop);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    if (this._onPointerMove) window.removeEventListener("pointermove", this._onPointerMove);
  }
}
