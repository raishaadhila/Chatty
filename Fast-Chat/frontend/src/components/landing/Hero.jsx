import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GradientButton, OutlineButton } from '../shared/ui';

export default function Hero() {
  const { scrollY } = useScroll();
  const blobY = useTransform(scrollY, [0, 500], [0, 100]);
  const blobX = useTransform(scrollY, [0, 500], [0, 30]);

  const [typingStep, setTypingStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingStep(prev => (prev >= 3 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-bg-primary">
      <motion.div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.08] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #5B6EF5 0%, #9B5CF6 50%, transparent 70%)',
          filter: 'blur(80px)',
          x: blobX, y: blobY,
        }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.06] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #16C79A 0%, transparent 70%)',
          filter: 'blur(60px)',
          x: useTransform(scrollY, [0, 500], [0, -40]),
          y: useTransform(scrollY, [0, 500], [0, -60]),
        }}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0iI2UyZThmMCIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+')] opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-secondary to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-1.5 shadow-sm mb-8">
            <Sparkles size={14} className="text-status-success" />
            <span className="text-sm font-medium text-slate-600">AI Customer Service That Never Sleeps</span>
          </div>
        </motion.div>

        <motion.h1
          className="font-display text-hero font-extrabold leading-[1.05] text-text-primary mb-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Your AI Customer Service Team,<br />
          Working <span className="gradient-text">24/7</span>
        </motion.h1>

        <motion.p
          className="text-lg text-text-secondary max-w-2xl mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          Chatty replies in under 2 seconds, checks live stock and prices, sends invoices, follows up automatically, and sends you a daily business briefing — all on WhatsApp and Telegram.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <GradientButton className="text-base px-8 py-4 shadow-glow-primary">
            <a href="/login">Start Free Trial</a>
          </GradientButton>
          <OutlineButton className="text-base px-8 py-4 flex items-center gap-2">
            <Play size={18} /> Watch Demo
          </OutlineButton>
        </motion.div>

        <motion.div
          className="relative w-full max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="bg-bg-secondary px-4 py-3 flex items-center gap-2 border-b border-slate-100">
              <div className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" /><span className="w-3 h-3 rounded-full bg-amber-400" /><span className="w-3 h-3 rounded-full bg-emerald-400" /></div>
              <span className="text-xs text-text-muted font-mono">Chatty — WhatsApp</span>
            </div>
            <div className="p-6 space-y-4 min-h-[240px]">
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] shadow-sm">
                  <p className="text-sm text-text-primary">Halo, apakah hoodie warna biru ukuran M masih ada?</p>
                  <p className="text-xs text-text-muted mt-1">10:23</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gradient-hero text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} className="text-white/80" />
                    <span className="text-[10px] text-white/70 font-medium">AI REPLY</span>
                  </div>
                  {typingStep < 2 ? (
                    <div className="flex gap-1 py-1">
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <p className="text-sm">Halo! Iya, hoodie biru ukuran M masih tersedia. Stok: 12 pcs. Harga: Rp 150.000. Mau saya bantu pesan? 😊</p>
                  )}
                  <p className="text-[10px] text-white/60 mt-1 text-right">10:23</p>
                </div>
              </div>
              {typingStep >= 1 && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] shadow-sm">
                    <p className="text-sm text-text-primary">Baik, saya pesan 1 ya. Ada diskon?</p>
                    <p className="text-xs text-text-muted mt-1">10:24</p>
                  </div>
                </div>
              )}
              {typingStep >= 3 && (
                <div className="flex justify-end">
                  <div className="bg-gradient-hero text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm">Tentu! Ada promo spesial: diskon 10% untuk pembelian 2 item atau lebih. Kode: CHATTY10 🎉</p>
                    <p className="text-[10px] text-white/60 mt-1 text-right">10:24</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <motion.div
            className="absolute -top-4 -right-4 bg-white rounded-xl shadow-card p-3 border border-slate-100 hidden md:block"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-xs text-text-muted">Response time</p>
            <p className="text-lg font-bold text-status-success">1.2s</p>
          </motion.div>
          <motion.div
            className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-card p-3 border border-slate-100 hidden md:block"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <p className="text-xs text-text-muted">Today</p>
            <p className="text-lg font-bold text-accent-primary">47 convos</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
