import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Card, Badge } from '../components/shared/ui';
import { api } from '../lib/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { api('/dashboard/customers').then(setCustomers).catch(() => {}); }, []);

  const filtered = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-text-primary">Customers</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/40 w-64" placeholder="Search customers..." />
        </div>
      </div>
      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Customer</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Channel</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Messages</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">First Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((c, i) => (
              <tr key={i} className="hover:bg-bg-secondary/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-hero/70 flex items-center justify-center text-white text-xs font-bold">{c.name?.[0] || '?'}</div>
                    <span className="text-sm font-medium text-text-primary">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant={c.channel === 'whatsapp' ? 'success' : 'info'}>{c.channel}</Badge></td>
                <td className="px-4 py-3 text-sm text-text-secondary">{c.messageCount}</td>
                <td className="px-4 py-3 text-sm text-text-muted">{c.firstContact ? new Date(c.firstContact).toLocaleDateString('id-ID') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
