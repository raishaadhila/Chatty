import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Sparkles, Check, ArrowRight, FileText, Link, Smartphone, MessageSquare } from 'lucide-react';
import { GradientButton, OutlineButton } from '../components/shared/ui';

const STEPS = [
  { key: 'business-profile', icon: FileText, title: 'Business Profile', desc: 'Tell us about your business' },
  { key: 'connect-channel', icon: Smartphone, title: 'Connect Channel', desc: 'Link WhatsApp or Telegram' },
  { key: 'catalog-setup', icon: Link, title: 'Catalog', desc: 'Add your products (optional)' },
  { key: 'test-ai', icon: MessageSquare, title: 'Test AI', desc: 'See Chatty in action' },
  { key: 'setup-reports', icon: FileText, title: 'Reports', desc: 'Set up daily briefings' },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ businessName: '', businessType: 'e-commerce', primaryLanguage: 'both', brandTone: 'friendly' });
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    api('/onboarding/status').then(s => {
      if (s.currentStep) {
        const idx = STEPS.findIndex(st => st.key === s.currentStep);
        if (idx >= 0) setCurrentStep(idx);
        if (s.currentStep === 'completed') setComplete(true);
      }
    }).catch(() => {});
  }, []);

  async function handleContinue(stepData = {}) {
    setLoading(true);
    const step = STEPS[currentStep];
    try {
      const res = await api('/onboarding/step', {
        method: 'POST',
        body: JSON.stringify({ step: step.key, data: { ...formData, ...stepData } }),
      });
      if (res.nextStep) {
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      } else if (res.isComplete) {
        setComplete(true);
        setTimeout(() => window.location.href = '/app', 2000);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  if (complete) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-status-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-text-primary mb-2">You're all set!</h2>
          <p className="text-text-secondary">Taking you to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
      <motion.div layout className="bg-white rounded-2xl shadow-card-hover border border-slate-100 p-8 w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="font-display text-xl font-bold text-text-primary">Chatty<span className="text-accent-primary">.</span></h1>
          <span className="text-text-muted text-sm">Onboarding</span>
        </div>

        <div className="flex gap-2 mb-8">
          {STEPS.map((step, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all ${i <= currentStep ? 'bg-gradient-hero' : 'bg-slate-200'}`} />
              <p className={`text-xs mt-1.5 font-medium ${i === currentStep ? 'text-accent-primary' : i < currentStep ? 'text-status-success' : 'text-text-muted'}`}>
                {step.title}
              </p>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-accent-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-text-primary">Tell us about your business</h2>
                  <p className="text-text-muted text-sm mt-1">This helps us set up your AI's personality.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">Business Name</label>
                  <input value={formData.businessName} onChange={e => setFormData(p => ({ ...p, businessName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/40" placeholder="Toko Aisyah Fashion" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">Business Type</label>
                    <select value={formData.businessType} onChange={e => setFormData(p => ({ ...p, businessType: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/40">
                      <option value="e-commerce">E-commerce</option>
                      <option value="food-beverage">Food & Beverage</option>
                      <option value="services">Services</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">Language</label>
                    <select value={formData.primaryLanguage} onChange={e => setFormData(p => ({ ...p, primaryLanguage: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/40">
                      <option value="both">Bahasa & English</option>
                      <option value="bahasa">Bahasa Indonesia</option>
                      <option value="english">English</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">Brand Tone</label>
                  <div className="flex gap-2">
                    {['friendly', 'professional', 'casual', 'formal'].map(tone => (
                      <button key={tone} onClick={() => setFormData(p => ({ ...p, brandTone: tone }))}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.brandTone === tone ? 'bg-accent-primary text-white' : 'bg-bg-secondary text-text-secondary hover:bg-slate-200'}`}>
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <GradientButton className="w-full mt-4" onClick={() => handleContinue()} disabled={!formData.businessName || loading}>
                  {loading ? 'Saving...' : 'Continue'} <ArrowRight size={16} className="inline ml-1" />
                </GradientButton>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Smartphone size={28} className="text-accent-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-text-primary">Connect a channel</h2>
                  <p className="text-text-muted text-sm mt-1">Link WhatsApp or Telegram to start receiving messages.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg-secondary rounded-xl p-6 text-center border border-slate-200 hover:border-accent-primary/40 cursor-pointer transition-all">
                    <div className="w-12 h-12 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare size={24} className="text-status-success" />
                    </div>
                    <h3 className="font-medium text-text-primary">WhatsApp</h3>
                    <p className="text-xs text-text-muted mt-1">Business API</p>
                  </div>
                  <div className="bg-bg-secondary rounded-xl p-6 text-center border border-accent-primary/40 cursor-pointer transition-all">
                    <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare size={24} className="text-accent-primary" />
                    </div>
                    <h3 className="font-medium text-text-primary">Telegram</h3>
                    <p className="text-xs text-text-muted mt-1">Bot API</p>
                  </div>
                </div>
                <GradientButton className="w-full" onClick={() => handleContinue({ channelType: 'telegram', channelToken: 'placeholder' })} disabled={loading}>
                  {loading ? 'Connecting...' : 'Connect Telegram'} <ArrowRight size={16} className="inline ml-1" />
                </GradientButton>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Link size={28} className="text-accent-primary" />
                </div>
                <h2 className="font-display text-xl font-bold text-text-primary">Add your product catalog</h2>
                <p className="text-text-muted text-sm">Upload a CSV or connect Google Sheets so your AI can answer stock/price questions. Or skip for now.</p>
                <div className="flex justify-center gap-3">
                  <OutlineButton className="text-sm">Upload CSV</OutlineButton>
                  <OutlineButton className="text-sm">Connect Sheets</OutlineButton>
                </div>
                <div className="flex gap-3 justify-center">
                  <GradientButton onClick={() => handleContinue({ skipped: true })} disabled={loading}>
                    {loading ? '...' : 'Skip for now'}
                  </GradientButton>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={28} className="text-accent-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-text-primary">Test your AI</h2>
                  <p className="text-text-muted text-sm">Here's how Chatty will respond to your customers.</p>
                </div>
                <div className="bg-bg-secondary rounded-xl p-4 border border-slate-200">
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] shadow-sm">
                        <p className="text-sm">Halo, ada stok hoodie hitam size L?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-gradient-hero text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles size={12} className="text-white/80" />
                          <span className="text-[10px] text-white/70">AI REPLY</span>
                        </div>
                        <p className="text-sm">Halo! Ada, stok hoodie hitam size L tersedia 8 pcs seharga Rp 175.000. Mau saya bantu pesan? 😊</p>
                      </div>
                    </div>
                  </div>
                </div>
                <GradientButton className="w-full" onClick={() => handleContinue()} disabled={loading}>
                  {loading ? '...' : 'Looks great! Continue'} <ArrowRight size={16} className="inline ml-1" />
                </GradientButton>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-accent-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-text-primary">Set up your reports</h2>
                  <p className="text-text-muted text-sm">Get a daily briefing on WhatsApp or email every morning.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">Owner Email</label>
                  <input type="email" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/40" placeholder="owner@bisnis.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">WhatsApp Number (optional)</label>
                  <input type="tel" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/40" placeholder="+628123456789" />
                </div>
                <div className="flex gap-3">
                  <GradientButton className="flex-1" onClick={() => handleContinue()} disabled={loading}>
                    {loading ? 'Saving...' : 'Go to Dashboard'} <ArrowRight size={16} className="inline ml-1" />
                  </GradientButton>
                  <OutlineButton className="text-sm" onClick={() => handleContinue({ skipped: true })}>Skip</OutlineButton>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
