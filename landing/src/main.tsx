import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// latin-only subsets — the site is English-only, and pulling in the
// default (cyrillic/greek/vietnamese/symbols) subsets would multiply
// the font payload for no benefit, especially for the single-file
// artifact build where everything gets inlined regardless of whether
// a subset is ever used
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-800.css";
import "@fontsource/geist-mono/latin-500.css";
import "@fontsource/geist-mono/latin-600.css";
import "./styles/global.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
