// Post-processes dist-artifact/index.html so it also works when opened
// directly via file:// (double-click), not just when served over http.
//
// Vite always tags its entry script type="module" regardless of the
// rollup output format. Browsers block type="module" scripts under the
// file:// origin (CORS), so the page loads to a black screen. Fix: make
// it a plain classic script. Classic *inline* scripts run immediately
// wherever they sit in the document (defer/async only affect scripts
// with a src attribute), so it also has to move below <div id="root">
// or it executes before that element exists.
import { readFileSync, writeFileSync } from "node:fs";

const path = "dist-artifact/index.html";
let html = readFileSync(path, "utf-8");

const match = html.match(/<script type="module"[^>]*>[\s\S]*?<\/script>/);
if (!match) {
  console.warn("fix-artifact-html: no type=module script found, skipping");
  process.exit(0);
}

const original = match[0];
const classicScript = original.replace(/^<script[^>]*>/, "<script>");
// use function replacers: the minified bundle is full of literal "$"
// characters (used as a JSX-runtime identifier), and string.replace()
// treats "$&", "$`", "$'", "$1".. specially in a *string* replacement,
// which corrupts the output.
html = html.replace(original, () => "");
html = html.replace("</body>", () => `${classicScript}\n</body>`);

writeFileSync(path, html);
console.log("fix-artifact-html: relocated + de-moduled entry script");
