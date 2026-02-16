import { Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

export function MarketingLayout() {
  const navigate = useNavigate();
  const goLogin = () => navigate("/login");
  const goRegister = () => navigate("/register");
  const goComingSoon = () => navigate("/coming-soon");

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigateLogin={goLogin} onNavigateRegister={goRegister} />
      <main className="pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer onNavigateComingSoon={goComingSoon} />
    </div>
  );
}
