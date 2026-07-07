# The Trading Floor — landing page

Static, dependency-free landing page with a Three.js hero (loaded via CDN
importmap, no build step). Lives alongside the bot but deploys independently
as static files.

## Preview locally

```
cd landing
python3 -m http.server 8000
```

Then open http://localhost:8000. (Opening `index.html` directly via `file://`
won't work — ES module imports require an HTTP server.)

## Images

See `assets/README.md` — drop `image-1.jpg`, `image-2.jpg`, `image-3.jpg`
into `assets/` to replace the generated placeholder textures on the three
orbiting planes.
