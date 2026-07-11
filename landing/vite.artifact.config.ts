import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// One-off config that bundles the whole app (JS, CSS, images) into a
// single self-contained dist-artifact/index.html for preview hosting
// that can't serve a directory of separate assets. Output as a plain
// IIFE (not type="module") so it also works when opened directly via
// file:// — browsers block module scripts under the file:// origin.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist-artifact",
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 10_000,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: "iife",
      },
    },
  },
});
