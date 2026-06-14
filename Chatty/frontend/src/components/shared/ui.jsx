import { motion } from 'framer-motion';

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true, margin: '-100px' },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2 } },
};

export function GradientButton({ children, className = '', ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(91,110,245,0.25)' }}
      whileTap={{ scale: 0.98 }}
      className={`bg-gradient-hero text-white font-semibold rounded-pill px-6 py-3 transition-all ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function OutlineButton({ children, className = '', ...props }) {
  return (
    <button
      className={`bg-white border border-slate-300 text-text-secondary hover:bg-slate-50 font-medium rounded-pill px-6 py-3 transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-accent-primary/10 text-accent-primary',
    success: 'bg-status-success/10 text-status-success',
    warning: 'bg-status-warning/10 text-status-warning',
    danger: 'bg-status-danger/10 text-status-danger',
    info: 'bg-bg-secondary text-text-secondary',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div
      className={`bg-white border border-slate-100 rounded-2xl shadow-card ${hover ? 'hover:shadow-card-hover' : ''} ${className}`}
      {...(hover ? hoverLift : {})}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MetricCard({ icon: Icon, label, value, trend, trendUp }) {
  return (
    <Card className="p-5" hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-muted text-sm font-medium">{label}</p>
          <p className="text-text-primary text-2xl font-bold mt-1">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${trendUp ? 'text-status-success' : 'text-status-danger'}`}>
              {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && <div className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary"><Icon size={20} /></div>}
      </div>
    </Card>
  );
}

export function StatusDot({ active = true }) {
  return (
    <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${active ? 'bg-status-success' : 'bg-slate-300'}`}>
      {active && (
        <span className="absolute inset-0 rounded-full bg-status-success animate-ping opacity-40" />
      )}
    </span>
  );
}

export function Section({ children, className = '', dark = false, id }) {
  return (
    <section id={id} className={`py-[clamp(64px,10vw,120px)] ${dark ? 'bg-bg-secondary' : 'bg-bg-primary'} ${className}`}>
      <div className="max-w-[1280px] mx-auto px-[clamp(20px,5vw,48px)]">
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children, color = 'accent-primary' }) {
  const colors = {
    'accent-primary': 'text-accent-primary',
    'accent-secondary': 'text-accent-secondary',
    'accent-warm': 'text-accent-warm',
  };
  return (
    <p className={`text-sm font-bold uppercase tracking-widest mb-3 ${colors[color]}`}>{children}</p>
  );
}
