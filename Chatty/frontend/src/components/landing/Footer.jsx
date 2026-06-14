import { Section } from '../shared/ui';

const footerLinks = {
  Product: ['Features', 'Pricing', 'How It Works', 'FAQ'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Resources: ['Help Center', 'API Docs', 'Community', 'Partners'],
  Legal: ['Privacy', 'Terms', 'Cookies', 'GDPR'],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-bg-secondary">
      <Section className="!py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-display text-lg font-bold text-text-primary">
              Chatty<span className="text-accent-primary">.</span>
            </h3>
            <p className="text-text-muted text-sm mt-2">AI Customer Service Platform for Indonesian SMBs.</p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-text-primary text-sm font-semibold mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-text-secondary hover:text-text-primary text-sm transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <div className="border-t border-slate-100 py-6">
        <div className="max-w-[1280px] mx-auto px-[clamp(20px,5vw,48px)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">© 2026 Chatty. All rights reserved.</p>
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <span className="text-base">🇮🇩</span> Indonesia
          </div>
        </div>
      </div>
    </footer>
  );
}
