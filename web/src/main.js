import "./style.css";
import { HeroScene } from "./three/app.js";

const canvas = document.getElementById("scene");
const loader = document.getElementById("loader");

const hero = new HeroScene(canvas);
hero.start();

// Let the first frames render before lifting the curtain so the reveal
// itself feels intentional rather than a flash of an unfinished scene.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      loader.classList.add("is-hidden");
    }, 350);
  });
});
