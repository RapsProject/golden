import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

interface NavbarProps {
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
}

export function Navbar({ onNavigateLogin, onNavigateRegister }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const menuItems = ["Features", "Pricing", "Testimonials"];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-[padding] duration-500 ease-in-out",
        isScrolled ? "pt-4 px-4" : "pt-0 px-0"
      )}
    >
      <div
        className={cn(
          "mx-auto transition-all duration-500 ease-in-out",
          isScrolled
            ? "max-w-5xl bg-white/60 backdrop-blur-xl shadow-lg shadow-black/[0.08] rounded-full border border-white/40"
            : "max-w-full bg-white/50 backdrop-blur-lg border-b border-brand-light"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-500 ease-in-out mx-auto",
            isScrolled
              ? "h-14 px-6 md:px-8"
              : "h-16 md:h-20 max-w-7xl px-4 sm:px-6 lg:px-8"
          )}
        >
          {/* Logo */}
          <div className="flex items-center">
            <a
              href="/"
              className="flex items-center gap-2 font-serif text-2xl font-bold text-brand-dark"
            >
              <img 
                src="/Logo_Sabi.png" 
                alt="SabiAcademia Logo" 
                className="object-contain w-8 h-8 md:w-10 md:h-10" 
              />
              <span>
                Sabi<span className="text-brand-primary">Academia</span>
              </span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="items-center hidden gap-8 md:flex">
            {menuItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-medium transition-colors text-slate-700 hover:text-brand-primary"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="items-center hidden gap-4 md:flex">
            <Button variant="outline" size="sm" onClick={onNavigateLogin}>
              Login
            </Button>
            <Button variant="primary" size="sm" onClick={onNavigateRegister}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 md:hidden text-brand-dark"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={cn(
              "md:hidden py-4 border-t border-brand-light",
              isScrolled ? "px-4 rounded-b-2xl" : "px-4"
            )}
          >
            <div className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="py-2 font-medium transition-colors text-slate-700 hover:text-brand-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-brand-light">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={onNavigateLogin}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={onNavigateRegister}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
