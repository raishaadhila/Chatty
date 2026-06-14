import { motion } from 'framer-motion';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { Section, Eyebrow, fadeUp } from '../shared/ui';

const problems = [
  'Manually replying to hundreds of WhatsApp messages daily',
  'Missing customer messages outside working hours',
  'No automated follow-ups — lost leads slip away',
  'Manual invoicing on paper or WhatsApp',
];

const solutions = [
  'AI replies instantly 24/7 in your brand voice',
  'Every message gets answered — never miss a lead',
  'Smart follow-ups re-engage customers automatically',
  'One command generates and sends invoices',
];

export default function ProblemSolution() {
  return (
    <Section id="problem">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <motion.div {...fadeUp}>
          <Eyebrow color="accent-warm">THE PROBLEM</Eyebrow>
          <h2 className="font-display text-h2 font-bold text-text-primary mb-6 leading-tight">
            You're losing customers while you sleep.
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Indonesian SMB owners spend 3-5 hours per day manually replying to customer messages on WhatsApp and Telegram. No system for follow-ups, manual invoicing, zero business visibility.
          </p>
          <ul className="space-y-4">
            {problems.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <XCircle size={20} className="text-status-danger shrink-0 mt-0.5" />
                <span className="text-text-secondary">{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
          <Eyebrow color="accent-secondary">THE CHATTY WAY</Eyebrow>
          <h2 className="font-display text-h2 font-bold text-text-primary mb-6 leading-tight">
            Chatty handles it — instantly, every time.
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Chatty automates your entire customer communication lifecycle. AI replies, follow-ups, invoices, and daily briefings — all without lifting a finger.
          </p>
          <ul className="space-y-4">
            {solutions.map((s, i) => (
              <motion.li key={i} className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-card"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <CheckCircle2 size={20} className="text-status-success shrink-0 mt-0.5" />
                <span className="text-text-primary font-medium">{s}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </Section>
  );
}
