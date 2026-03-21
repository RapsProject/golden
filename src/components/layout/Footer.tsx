import { Instagram, Twitter, TwitterIcon, XIcon, Youtube } from 'lucide-react';

const productLinks = ['Features', 'Pricing'];
const companyLinks = ['About Us', 'Contact'];
const legalLinks = ['Privacy Policy', 'Terms of Service'];

const socialLinks = [
  {
    name: 'Instagram',
    icon: <Instagram size={20} />,
    href: '#',
  },
  {
    name: 'TikTok',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
    href: '#',
  },
  {
    name: 'Twitter',
    icon: <Twitter size={20} />,
    href: '#',
  },
];

interface FooterProps {
  onNavigateComingSoon?: () => void;
}

export function Footer({ onNavigateComingSoon }: FooterProps) {
  return (
    <footer className="px-4 pb-4 mt-12">
      <div className="px-6 pb-8 mx-auto max-w-7xl rounded-3xl bg-slate-950 text-brand-light pt-14 sm:px-10 lg:px-14">
        {/* Top section: Logo + Bio */}
        <div className="mb-10">
          <div className="mb-3 font-serif text-2xl font-bold text-white">
            Sabi<span className="text-brand-primary">Academia</span>
          </div>
          <p className="max-w-sm text-sm text-slate-400">
            Exam-focused preparation for IUP ITB. Crafted by students who have passed the AqTest
            and know what really matters.
          </p>
        </div>

        {/* 4 aligned columns */}
        <div className="grid grid-cols-2 gap-8 mb-10 md:grid-cols-4">
          {/* Product */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-2 text-sm">
              {productLinks.map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="transition-colors text-slate-400 hover:text-brand-secondary"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-2 text-sm">
              {companyLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="transition-colors text-slate-400 hover:text-brand-secondary"
                    onClick={onNavigateComingSoon}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect - Social Media Icons */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Connect</h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <button
                  key={social.name}
                  type="button"
                  className="p-2 transition-colors rounded-lg text-slate-400 hover:text-brand-secondary hover:bg-slate-800"
                  onClick={onNavigateComingSoon}
                  aria-label={social.name}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="transition-colors text-slate-400 hover:text-brand-secondary"
                    onClick={onNavigateComingSoon}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 pt-4 mt-4 text-xs border-t border-slate-800 md:flex-row text-slate-500">
          <div>
            © 2026 SabiAcademia. Made by ITB Students.
          </div>
          <div className="flex gap-4">
            <span>Bandung · Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
