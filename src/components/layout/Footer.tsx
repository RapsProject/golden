import { Container } from '../ui/Container';

const productLinks = ['Features', 'Pricing', 'Syllabus'];
const companyLinks = ['About Us', 'Contact'];
const legalLinks = ['Privacy Policy', 'Terms of Service'];
const socialLinks = ['Instagram', 'TikTok', 'YouTube'];

interface FooterProps {
  onNavigateComingSoon?: () => void;
}

export function Footer({ onNavigateComingSoon }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-brand-light pt-16 pb-8 mt-12">
      <Container>
        <div className="grid gap-10 md:grid-cols-4 mb-10">
          {/* Logo / Bio */}
          <div>
            <div className="text-2xl font-bold font-serif text-white mb-3">
              Golden<span className="text-brand-primary">Path</span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              Exam-focused preparation for IUP ITB. Crafted by students who have passed the AqTest
              and know what really matters.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              {productLinks.map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-slate-400 hover:text-brand-secondary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              {companyLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-brand-secondary transition-colors"
                    onClick={onNavigateComingSoon}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials / Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Connect</h3>
            <ul className="space-y-2 text-sm mb-4">
              {socialLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-brand-secondary transition-colors"
                    onClick={onNavigateComingSoon}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="text-sm font-semibold text-white mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-brand-secondary transition-colors"
                    onClick={onNavigateComingSoon}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 mt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © 2025 GoldenPath. Made with ❤️ by ITB Students.
          </div>
          <div className="flex gap-4">
            <span>Bandung · Indonesia</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

