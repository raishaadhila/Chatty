import { useState } from 'react';
import { Repeat, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, GradientButton, Badge } from '../components/shared/ui';

const mock = [
  { id: 1, name: 'Post-Purchase Check-in', trigger: 'Purchase detected', steps: 3, active: true, sent: 28, converted: 12 },
  { id: 2, name: 'Cold Lead Re-engagement', trigger: 'No reply > 24h', steps: 2, active: true, sent: 45, converted: 8 },
  { id: 3, name: 'Cart Abandonment', trigger: 'Inquiry, no purchase', steps: 3, active: false, sent: 15, converted: 4 },
];

export default function FollowUps() {
  const [sequences] = useState(mock);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-text-primary">Follow-up Sequences</h2>
        <GradientButton className="text-sm flex items-center gap-2">
          <Plus size={16} /> Create Sequence
        </GradientButton>
      </div>
      <div className="grid gap-4">
        {sequences.map(seq => (
          <Card key={seq.id} className="p-6" hover>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent-primary/10"><Repeat size={18} className="text-accent-primary" /></div>
                  <h3 className="font-semibold text-text-primary">{seq.name}</h3>
                  <Badge variant={seq.active ? 'success' : 'info'}>{seq.active ? 'Active' : 'Paused'}</Badge>
                </div>
                <p className="text-sm text-text-muted mb-3">Trigger: {seq.trigger} · {seq.steps} steps</p>
                <div className="flex items-center gap-2">
                  {Array.from({ length: seq.steps }).map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                      {i < seq.steps - 1 && <div className="w-6 h-0.5 bg-slate-200" />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <button className="text-text-muted hover:text-accent-primary p-1">
                  {seq.active ? <ToggleRight size={22} className="text-status-success" /> : <ToggleLeft size={22} />}
                </button>
                <div className="mt-3 text-xs text-text-muted">
                  <p>{seq.sent} sent · {seq.converted} converted</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
