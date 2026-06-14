import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Minus, Sparkles } from 'lucide-react';
import { Section, Eyebrow, GradientButton, staggerContainer, fadeUp } from '../shared/ui';

const plans = [
  {
    name: 'Starter',
    tagline: 'Just trying it out',
    price: 19,
    annualPrice: 15,
    popular: false,
    features: [
      { text: '500 AI conversations/mo', included: true },
      { text: 'WhatsApp + Telegram', included: true },
      { text: '3 invoices/month', included: true },
      { text: '2 follow-up sequences', included: true },
      { text: '1 team seat', included: true },
      { text: 'Owner WA briefings', included: false },
      { text: 'Branded PDF reports', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    name: 'Growth',
    tagline: 'Daily work replacement',
    price: 59,
    annualPrice: 47,
    popular: true,
    features: [
      { text: '2,500 AI conversations/mo', included: true },
      { text: '3 channels (+ Instagram)', included: true },
      { text: 'Unlimited invoices', included: true },
      { text: 'Unlimited sequences', included: true },
      { text: '2 team seats', included: true },
      { text: 'WA morning & evening briefings', included: true },
      { text: 'Branded PDF reports', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    name: 'Pro',
    tagline: 'Teams & agencies',
    price: 149,
    annualPrice: 119,
    popular: false,
    features: [
      { text: 'Unlimited conversations', included: true },
      { text: 'Unlimited channels', included: true },
      { text: 'Unlimited invoices', included: true },
      { text: 'Unlimited sequences', included: true },
      { text: '5 team seats', included: true },
      { text: '10 agency workspaces', included: true },
      { text: 'Branded PDF reports', included: true },
      { text: 'API access', included: true },
    ],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <Section id="pricing" dark>
      <div className="text-center mb-12">
        <Eyebrow>PRICING</Eyebrow>
        <h2 className="font-display text-h2 font-bold text-text-primary mb-6">Simple pricing that grows with you</h2>
        <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-pill p-1.5 shadow-sm">
          <button onClick={() => setAnnual(false)} className={`px-4 py-2 rounded-pill text-sm font-medium transition-all ${!annual ? 'bg-accent-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>Monthly</button>
          <button onClick={() => setAnnual(true)} className={`px-4 py-2 rounded-pill text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-accent-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
            Annual
            {annual && <span className="text-[10px] bg-white/20 rounded-pill px-2 py-0.5">Save 20%</span>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div key={i} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`relative bg-white border rounded-2xl p-8 shadow-card ${plan.popular ? 'border-accent-primary border-2 shadow-glow-primary scale-[1.02] md:scale-105' : 'border-slate-200'}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-hero text-white text-xs font-bold rounded-pill px-4 py-1 flex items-center gap-1">
                <Sparkles size={12} /> Most Popular
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-bold text-text-primary">{plan.name}</h3>
              <p className="text-text-muted text-sm mt-1">{plan.tagline}</p>
              <div className="mt-4">
                <span className="font-display text-4xl font-bold text-text-primary">${annual ? plan.annualPrice : plan.price}</span>
                <span className="text-text-muted text-sm">/month</span>
              </div>
              {annual && <p className="text-status-success text-xs mt-1">Billed annually (${plan.price}/mo)</p>}
            </div>

            <GradientButton className={`w-full mb-6 text-sm ${plan.popular ? '' : 'opacity-0 pointer-events-none'}`}>
              {plan.popular ? 'Get Started' : ' '}
            </GradientButton>
            {!plan.popular && (
              <button className="w-full mb-6 text-sm bg-white border border-slate-300 text-text-secondary hover:bg-slate-50 font-medium rounded-pill px-6 py-3 transition-all">
                Get Started
              </button>
            )}

            <ul className="space-y-3">
              {plan.features.map((f, j) => (
                <li key={j} className={`flex items-center gap-3 text-sm ${f.included ? 'text-text-primary' : 'text-text-muted'}`}>
                  {f.included ? <Check size={16} className="text-status-success shrink-0" /> : <Minus size={16} className="text-text-muted shrink-0" />}
                  {f.text}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
