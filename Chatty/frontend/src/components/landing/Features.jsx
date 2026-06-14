import { MessageSquare, Package, Repeat, FileText, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Section, Eyebrow, Badge, Card, fadeInLeft, fadeInRight } from '../shared/ui';

const modules = [
  {
    num: '01', icon: MessageSquare, title: 'Smart Inbox', color: '#5B6EF5',
    desc: 'Receive all inbound messages from WhatsApp and Telegram, routed through AI that replies in under 2 seconds. Monitor conversations, toggle AI on/off, and manually override any reply.',
    tags: ['< 2s response', 'Bahasa & English', 'Human escalation'],
  },
  {
    num: '02', icon: Package, title: 'Real-Time Stock & Pricing', color: '#16C79A',
    desc: 'Connect your product catalog via CSV or Google Sheets. AI checks live stock and prices before answering. Graceful fallback if catalog is not configured.',
    tags: ['CSV upload', 'Google Sheets sync', '15-min refresh'],
  },
  {
    num: '03', icon: Repeat, title: 'Automated Follow-Ups', color: '#9B5CF6',
    desc: 'Create trigger-based follow-up sequences. Re-engage cold leads, send post-purchase check-ins, and automate cart abandonment recovery.',
    tags: ['Up to 3 steps', 'AI personalized', 'Cart detection'],
  },
  {
    num: '04', icon: FileText, title: 'Invoice Generation', color: '#F5A623',
    desc: 'Type a natural language command — AI parses it, generates a PDF invoice, and sends it via WhatsApp or email. Track unpaid, paid, and overdue.',
    tags: ['NL command', 'PDF export', 'Payment reminders'],
  },
  {
    num: '05', icon: BarChart3, title: 'Owner Reports', color: '#5B6EF5',
    desc: 'Get a daily WhatsApp briefing every morning, a weekly recap every Monday, and instant escalation alerts when something urgent happens.',
    tags: ['WA briefing', 'Email digest', 'Urgent alerts'],
  },
];

export default function Features() {
  return (
    <Section id="features" dark>
      <div className="text-center mb-16">
        <Eyebrow>WHAT CHATTY DOES</Eyebrow>
        <h2 className="font-display text-h2 font-bold text-text-primary mb-4">Five ways Chatty runs your customer service</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">From the first message to the final invoice, Chatty handles every step of your customer journey.</p>
      </div>

      <div className="space-y-20">
        {modules.map((mod, i) => {
          const isLeft = i % 2 === 0;
          const MotionComp = isLeft ? fadeInLeft : fadeInRight;
          return (
            <motion.div key={i} {...MotionComp} className={`flex flex-col ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 items-center`}>
              <div className="flex-1">
                <span className="font-display text-4xl font-bold text-accent-primary/20">{mod.num}</span>
                <div className="flex items-center gap-3 mt-2 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: `${mod.color}15` }}>
                    <mod.icon size={22} style={{ color: mod.color }} />
                  </div>
                  <h3 className="font-display text-h3 font-bold text-text-primary">{mod.title}</h3>
                </div>
                <p className="text-text-secondary leading-relaxed mb-4">{mod.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {mod.tags.map(tag => (
                    <Badge key={tag} variant="info">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full">
                <Card className="p-6 md:p-8 border-t-4" style={{ borderTopColor: mod.color }}>
                  <div className="rounded-xl bg-bg-secondary h-48 md:h-56 flex items-center justify-center">
                    <div className="text-center">
                      <mod.icon size={48} className="text-text-muted/40 mx-auto mb-3" />
                      <p className="text-text-muted text-sm">{mod.title} interface</p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
