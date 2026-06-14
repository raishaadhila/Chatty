import { BarChart3, MessageSquare, TrendingUp, DollarSign, TrendingDown } from 'lucide-react';
import { MetricCard, Card } from '../components/shared/ui';

export default function Reports() {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-text-primary mb-6">Reports & Analytics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={MessageSquare} label="Total Conversations" value="1,247" trend={12} trendUp />
        <MetricCard icon={TrendingUp} label="Avg Response Time" value="1.2s" trend={8} trendUp />
        <MetricCard icon={TrendingDown} label="Conversion Rate" value="24%" trend={3} trendUp={false} />
        <MetricCard icon={DollarSign} label="Revenue This Month" value="Rp 4.2M" trend={18} trendUp />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold text-text-primary mb-4">Conversation Volume</h3>
          <div className="h-48 bg-bg-secondary rounded-xl flex items-center justify-center">
            <BarChart3 size={32} className="text-text-muted/30" />
            <span className="text-text-muted text-sm ml-2">Chart area</span>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Channel Breakdown</h3>
          <div className="space-y-3">
            {[{ ch: 'WhatsApp', pct: 68, color: 'bg-status-success' }, { ch: 'Telegram', pct: 24, color: 'bg-accent-primary' }, { ch: 'Instagram', pct: 8, color: 'bg-accent-tertiary' }].map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">{c.ch}</span>
                  <span className="text-text-primary font-medium">{c.pct}%</span>
                </div>
                <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Owner Briefing Settings</h3>
          <div className="space-y-3">
            {[
              { label: 'Morning briefing (8 AM)', ch: 'WA', on: true },
              { label: 'Evening summary (9 PM)', ch: 'WA', on: false },
              { label: 'Weekly recap (Monday)', ch: 'Email', on: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-text-primary">{s.label}</p>
                  <p className="text-xs text-text-muted">via {s.ch}</p>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors ${s.on ? 'bg-status-success' : 'bg-slate-200'} relative cursor-pointer`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${s.on ? 'left-5' : 'left-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
