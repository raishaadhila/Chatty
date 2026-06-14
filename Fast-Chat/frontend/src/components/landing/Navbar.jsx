import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientButton } from '../shared/ui';

const links = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#testimonials', label: 'FAQ' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-card bg-white/95' : 'bg-white/70'}`}>
      <div className="max-w-[1280px] mx-auto px-[clamp(20px,5vw,48px)]">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="font-display text-xl font-bold text-text-primary">
            Chatty<span className="text-accent-primary">.</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <a key={l.href} href={l.href} className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors px-4 py-2">Log In</a>
            <GradientButton className="text-sm px-5 py-2.5">
              <a href="/login">Get Started</a>
            </GradientButton>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {links.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  className="block text-text-secondary hover:text-text-primary text-sm font-medium py-2">{l.label}</a>
              ))}
              <hr className="border-slate-100" />
              <a href="/login" className="block text-text-secondary text-sm font-medium py-2">Log In</a>
              <GradientButton className="w-full text-sm">
                <a href="/login">Get Started</a>
              </GradientButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
