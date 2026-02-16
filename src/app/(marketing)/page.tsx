import { useNavigate } from "react-router-dom";
import { Hero } from "../../components/sections/Hero";
import { ProblemStatement } from "../../components/sections/ProblemStatement";
import { InteractiveDemo } from "../../components/sections/InteractiveDemo";
import { Features } from "../../components/sections/Features";
import { Testimonials } from "../../components/sections/Testimonials";
import { Pricing } from "../../components/sections/Pricing";
import { FAQ } from "../../components/sections/FAQ";

export default function MarketingPage() {
  const navigate = useNavigate();
  const goRegister = () => navigate("/register");
  const goComingSoon = () => navigate("/coming-soon");

  return (
    <>
      <Hero
        onNavigateRegister={goRegister}
        onNavigateComingSoon={goComingSoon}
      />
      <ProblemStatement />
      <InteractiveDemo />
      <Features />
      <Testimonials />
      <Pricing
        onNavigateRegister={goRegister}
        onNavigateComingSoon={goComingSoon}
      />
      <FAQ />
    </>
  );
}
