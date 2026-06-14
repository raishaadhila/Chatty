import { useState } from 'react';
import { FileText, Plus, Send, Sparkles } from 'lucide-react';
import { Card, GradientButton, Badge } from '../components/shared/ui';

const mock = [
  { id: 'INV-001', customer: 'Aisyah', amount: 300000, status: 'paid', date: '2026-06-10', channel: 'whatsapp' },
  { id: 'INV-002', customer: 'Budi', amount: 175000, status: 'unpaid', date: '2026-06-12', channel: 'email' },
  { id: 'INV-003', customer: 'Citra', amount: 520000, status: 'overdue', date: '2026-06-05', channel: 'whatsapp' },
];

export default function Invoices() {
  const [showModal, setShowModal] = useState(false);
  const [command, setCommand] = useState('');

  const statusColors = { unpaid: 'warning', paid: 'success', overdue: 'danger' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-text-primary">Invoices</h2>
        <GradientButton className="text-sm flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Invoice
        </GradientButton>
      </div>
      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">#</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Customer</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Amount</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Date</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Channel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {mock.map((inv, i) => (
              <tr key={i} className="hover:bg-bg-secondary/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-text-primary">{inv.id}</td>
                <td className="px-4 py-3 text-sm text-text-primary">{inv.customer}</td>
                <td className="px-4 py-3 text-sm text-text-primary">Rp {inv.amount.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3"><Badge variant={statusColors[inv.status]}>{inv.status}</Badge></td>
                <td className="px-4 py-3 text-sm text-text-muted">{inv.date}</td>
                <td className="px-4 py-3"><Badge variant="info">{inv.channel}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-card-hover border border-slate-100 p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-text-primary mb-2">New Invoice</h3>
            <p className="text-sm text-text-muted mb-4">Type your invoice in plain language:</p>
            <textarea value={command} onChange={e => setCommand(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/40 min-h-[100px] resize-none"
              placeholder='e.g. "Invoice for Aisyah: 2x Hoodie Blue M Rp150k, due Friday"' />
            {command && (
              <div className="bg-accent-primary/5 border border-accent-primary/10 rounded-xl p-3 mt-3 flex items-start gap-2">
                <Sparkles size={16} className="text-accent-primary shrink-0 mt-0.5" />
                <div className="text-sm text-text-primary">
                  <p><strong>AI parsed:</strong> 2x Hoodie Blue M @ Rp150,000 = Rp300,000</p>
                  <p className="text-text-muted text-xs mt-1">Due: Friday · Customer: Aisyah</p>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-white border border-slate-300 text-text-secondary rounded-pill py-2.5 text-sm font-medium">Cancel</button>
              <GradientButton className="flex-1 text-sm flex items-center justify-center gap-2" disabled={!command}>
                <Send size={16} /> Create & Send
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
