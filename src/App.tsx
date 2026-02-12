import { useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./components/sections/Hero";
import { ProblemStatement } from "./components/sections/ProblemStatement";
import { InteractiveDemo } from "./components/sections/InteractiveDemo";
import { Features } from "./components/sections/Features";
import { Testimonials } from "./components/sections/Testimonials";
import { Pricing } from "./components/sections/Pricing";
import { FAQ } from "./components/sections/FAQ";
import { ComingSoon } from "./components/sections/ComingSoon";

type ViewMode = "landing" | "comingSoon";

function App() {
  const [view, setView] = useState<ViewMode>("landing");

  const handleGoToComingSoon = () => {
    setView("comingSoon");
  };

  const handleBackToLanding = () => {
    setView("landing");
  };

  if (view === "comingSoon") {
    return <ComingSoon onBackToLanding={handleBackToLanding} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigateComingSoon={handleGoToComingSoon} />
      <main className="pt-16 md:pt-20">
        <Hero onNavigateComingSoon={handleGoToComingSoon} />
        <ProblemStatement />
        <InteractiveDemo />
        <Features />
        <Testimonials />
        <Pricing onNavigateComingSoon={handleGoToComingSoon} />
        <FAQ />
      </main>
      <Footer onNavigateComingSoon={handleGoToComingSoon} />
    </div>
  );
}

export default App;
