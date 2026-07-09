import { useLenis } from "@/hooks/useLenis";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import AgentsSection from "./components/AgentsSection";
import ShrinkSection from "./components/ShrinkSection";
import SessionsSection from "./components/SessionsSection";
import RulesSection from "./components/RulesSection";
import Footer from "./components/Footer";
import GlobalEffects from "./components/GlobalEffects";

function App() {
  useLenis();

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <AgentsSection />
        <ShrinkSection />
        <SessionsSection />
        <RulesSection />
        <Footer />
      </main>
      <GlobalEffects />
    </>
  );
}

export default App;
