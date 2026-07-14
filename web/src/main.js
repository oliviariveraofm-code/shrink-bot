import "./style.css";
import { initHeroVideo } from "./hero-video.js";

const video = document.getElementById("heroVideo");
const loader = document.getElementById("loader");

const { ready } = initHeroVideo(video);

// Don't let a slow video fetch hold the curtain forever — the poster is
// already visible underneath, so a bounded wait is enough to feel intentional
// rather than a flash of an unfinished page.
const timeout = new Promise((resolve) => setTimeout(resolve, 1600));

Promise.race([ready, timeout]).then(() => {
  setTimeout(() => {
    loader.classList.add("is-hidden");
  }, 350);
});
