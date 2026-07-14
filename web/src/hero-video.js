const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Drives the hero background video: skips autoplay entirely under
// prefers-reduced-motion (poster stays as a static frame), and pauses
// playback via IntersectionObserver whenever the hero scrolls out of view.
export function initHeroVideo(video) {
  if (REDUCED_MOTION) {
    video.removeAttribute("autoplay");
    video.pause();
    return { ready: Promise.resolve() };
  }

  const ready = new Promise((resolve) => {
    if (video.readyState >= 2) {
      resolve();
    } else {
      video.addEventListener("loadeddata", () => resolve(), { once: true });
    }
  });

  video.play().catch(() => {
    // Autoplay can still be blocked by the browser; the poster frame
    // remains visible and playback resumes on the next user gesture.
  });

  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    },
    { threshold: 0.1 }
  );
  io.observe(video);

  return { ready };
}
