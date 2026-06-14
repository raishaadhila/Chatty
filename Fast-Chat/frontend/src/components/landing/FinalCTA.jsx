import { motion } from 'framer-motion';
import { Section, GradientButton, fadeUp } from '../shared/ui';

export default function FinalCTA() {
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-[0.04] pointer-events-none" />
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-accent-primary/5 blur-[100px] pointer-events-none" />
      <motion.div {...fadeUp} className="text-center relative z-10 max-w-3xl mx-auto">
        <h2 className="font-display text-h1 font-bold text-text-primary mb-6 leading-tight">
          Stop replying to customers manually.
        </h2>
        <p className="text-text-secondary text-lg mb-8">
          Join 100+ Indonesian businesses already using Chatty to automate their customer service.
        </p>
        <GradientButton className="text-base px-10 py-4">
          <a href="/login">Start Free Trial — No Credit Card Required</a>
        </GradientButton>
        <p className="text-text-muted text-sm mt-4">14-day money-back guarantee</p>
      </motion.div>
    </Section>
  );
}
