# Drop-in images

The hero section works out of the box with generated placeholder textures
(candlestick chart, equity curve, agent glyph). To use your own images,
drop exactly these three files into this folder:

- `image-1.jpg` — orbiting plane #1 (placeholder: candlestick chart)
- `image-2.jpg` — orbiting plane #2 (placeholder: equity/P&L curve)
- `image-3.jpg` — orbiting plane #3 (placeholder: agent emblem)

No code changes needed — `js/textures.js` tries to load these paths first
and only falls back to the generated placeholder if a file is missing.

Suggested content given the brand (dark trading-floor / Wall Street):
square or portrait crops work best (the planes are ~2.1:2.6), high
contrast so they read against the dark background — think chart
screenshots, a Discord/brand mark, or moody trading-floor photography.
