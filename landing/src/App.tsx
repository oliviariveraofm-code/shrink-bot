import { useState } from "react";
import { useLenis } from "./lib/useLenis";
import Scene from "./three/Scene";
import ErrorBoundary from "./components/ErrorBoundary";
import Nav from "./components/Nav";
import ProgressBar from "./components/ProgressBar";
import Hero from "./components/Hero";
import AgentsSection from "./components/AgentsSection";
import ShrinkSection from "./components/ShrinkSection";
import SessionsSection from "./components/SessionsSection";
import RulesSection from "./components/RulesSection";
import PricingSection from "./components/PricingSection";
import PropFirmsSection from "./components/PropFirmsSection";
import LoginModal from "./components/LoginModal";
import Footer from "./components/Footer";

export default function App() {
  useLenis();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <ErrorBoundary>
        <Scene />
      </ErrorBoundary>
      <div className="grain-overlay" />
      <ProgressBar />
      <Nav onOpenLogin={() => setLoginOpen(true)} />

      <main className="page">
        <Hero onOpenLogin={() => setLoginOpen(true)} />
        <AgentsSection />
        <ShrinkSection />
        <SessionsSection />
        <RulesSection />
        <PricingSection />
        <PropFirmsSection />
        <Footer />
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
