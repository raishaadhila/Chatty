import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Section, Card, fadeUp, staggerContainer } from '../shared/ui';

const testimonials = [
  { name: 'Aisyah', business: 'Fashion Boutique, Bandung', quote: 'I used to spend 3 hours every evening replying to WhatsApp messages. Now Chatty handles everything. I wake up to a morning briefing and that\'s it.', rating: 5 },
  { name: 'Budi', business: 'Home Decor, Jakarta', quote: 'The invoice feature alone saves me hours. I just type "Invoice for Aisyah: 2x Hoodie Rp150k" and Chatty does the rest — PDF, send, track.', rating: 5 },
  { name: 'Dini', business: 'Digital Agency, Surabaya', quote: 'Managing 5 client inboxes from one dashboard is incredible. My clients love the weekly branded reports.', rating: 5 },
];

export default function Testimonials() {
  return (
    <Section id="testimonials">
      <div className="text-center mb-12">
        <p className="text-sm font-bold uppercase tracking-widest text-accent-warm mb-3">TESTIMONIALS</p>
        <h2 className="font-display text-h2 font-bold text-text-primary">Loved by Indonesian business owners</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div key={i} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.15 }}>
            <Card className="p-6 h-full" hover>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} className="fill-accent-warm text-accent-warm" />
                ))}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-white text-sm font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-text-primary text-sm font-semibold">{t.name}</p>
                  <p className="text-text-muted text-xs">{t.business}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
