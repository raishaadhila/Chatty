import { motion } from 'framer-motion';
import { Link, Settings2, Rocket } from 'lucide-react';
import { Section, Eyebrow, staggerContainer, fadeUp } from '../shared/ui';

const steps = [
  { icon: Link, title: 'Connect', desc: 'Connect WhatsApp or Telegram in under 5 minutes with no technical skills required.' },
  { icon: Settings2, title: 'Configure', desc: 'Upload your catalog, set your brand tone, add FAQs — or skip it and go live with defaults.' },
  { icon: Rocket, title: 'Go Live', desc: 'Chatty starts replying instantly — 24/7. Your customers get answers, you get your time back.' },
];

export default function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="text-center mb-16">
        <Eyebrow>HOW IT WORKS</Eyebrow>
        <h2 className="font-display text-h2 font-bold text-text-primary">Get started in 3 simple steps</h2>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="hidden md:block absolute top-12 left-[17%] right-[17%] h-0.5 border-t-2 border-dashed border-slate-200" />

        {steps.map((step, i) => (
          <motion.div key={i} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.15 }}
            className="relative bg-white border border-slate-100 rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow text-center"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center mx-auto mb-5">
              <step.icon size={22} className="text-white" />
            </div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-hero text-white text-sm font-bold flex items-center justify-center shadow-md">
              {i + 1}
            </div>
            <h3 className="font-display text-lg font-bold text-text-primary mb-3">{step.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
