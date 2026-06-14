import { useState, useEffect } from 'react';
import { Search, Sparkles, Send, Phone, MessageCircle, MoreVertical } from 'lucide-react';
import { Card, StatusDot, Badge } from '../components/shared/ui';
import { api } from '../lib/api';

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api('/dashboard/conversations').then(setConversations).catch(() => {});
  }, []);

  const filtered = filter === 'all' ? conversations : conversations.filter(c => c.channel === filter);

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6">
      <div className="w-[320px] bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input className="w-full pl-9 pr-4 py-2 rounded-lg bg-bg-secondary border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/40" placeholder="Search conversations..." />
          </div>
          <div className="flex gap-1.5 mt-3">
            {['all', 'whatsapp', 'telegram'].map(ch => (
              <button key={ch} onClick={() => setFilter(ch)}
                className={`text-xs font-medium px-3 py-1.5 rounded-pill transition-all ${filter === ch ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-secondary hover:bg-bg-secondary'}`}>
                {ch === 'all' ? 'All' : ch === 'whatsapp' ? 'WA' : 'TG'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto divide-y divide-slate-50">
          {filtered.map((c, i) => (
            <div key={i} onClick={() => setActive(c)}
              className={`px-4 py-3 cursor-pointer transition-all hover:bg-bg-secondary ${active?.customerId === c.customerId ? 'bg-accent-primary/5' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-hero/80 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {(c.customerName || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text-primary truncate">{c.customerName}</p>
                    <span className="text-xs text-text-muted shrink-0">{c.lastMessage ? new Date(c.lastMessage.timestamp).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) : ''}</span>
                  </div>
                  <p className="text-xs text-text-muted truncate mt-0.5">{c.lastMessage?.content || 'No messages'}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {c.channel === 'whatsapp' ? <Phone size={11} className="text-status-success" /> : <MessageCircle size={11} className="text-accent-primary" />}
                    <StatusDot active />
                    <span className="text-[10px] text-text-muted">{c.messageCount} msgs</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-bg-secondary">
        {active ? (
          <>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${i % 2 === 0 ? 'bg-gradient-hero text-white rounded-br-sm' : 'bg-white border border-slate-100 shadow-sm rounded-bl-sm'}`}>
                    {i % 2 === 0 && (
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles size={11} className="text-white/70" />
                        <span className="text-[10px] text-white/60 font-medium">AI REPLY</span>
                      </div>
                    )}
                    <p className="text-sm">{i === 1 ? "Halo, apakah hoodie warna biru ukuran M masih ada?" : i === 2 ? "Halo! Iya, hoodie biru ukuran M masih tersedia, stok 12 pcs. Mau saya bantu pesan? 😊" : "Baik, saya pesan 1. Ada diskon?"}</p>
                    <p className={`text-[10px] mt-1 ${i % 2 === 0 ? 'text-white/50' : 'text-text-muted'}`}>10:2{i}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border-t border-slate-100 p-4 flex items-center gap-3">
              <input className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/40" placeholder="Type a message..." />
              <button className="p-2.5 rounded-xl bg-gradient-hero text-white"><Send size={18} /></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            <div className="text-center">
              <Inbox size={48} className="mx-auto mb-3 opacity-40" />
              <p>Select a conversation to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
