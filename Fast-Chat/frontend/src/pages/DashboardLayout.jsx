import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Users, Package, Repeat, FileText, BarChart3, Settings as SettingsIcon, Bell, LogOut, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { StatusDot } from '../components/shared/ui';
import { logout } from '../lib/api';

const navItems = [
  { to: '/app/inbox', icon: Inbox, label: 'Inbox', badge: true },
  { to: '/app/customers', icon: Users, label: 'Customers' },
  { to: '/app/catalog', icon: Package, label: 'Catalog' },
  { to: '/app/follow-ups', icon: Repeat, label: 'Follow-ups' },
  { to: '/app/invoices', icon: FileText, label: 'Invoices' },
  { to: '/app/reports', icon: BarChart3, label: 'Reports' },
  { to: '/app/settings', icon: SettingsIcon, label: 'Settings' },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-secondary flex">
      <aside className={`bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[240px]'} hidden md:flex`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          {!collapsed && (
            <button onClick={() => navigate('/app')} className="font-display text-lg font-bold text-text-primary">
              Chatty<span className="text-accent-primary">.</span>
            </button>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-muted">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-accent-primary/10 text-accent-primary border-l-[3px] border-accent-primary' : 'text-text-secondary hover:bg-bg-secondary'}`
              }
            >
              <item.icon size={20} />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="bg-accent-primary text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">3</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`px-3 py-4 border-t border-slate-100 ${collapsed ? 'text-center' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <StatusDot active />
            {!collapsed && <span className="text-xs font-medium text-status-success">AI Active</span>}
          </div>
          {!collapsed && (
            <>
              <div className="bg-bg-secondary rounded-lg px-3 py-2 text-xs">
                <span className="text-text-muted">Plan: </span>
                <span className="text-text-primary font-semibold">Growth</span>
                <a href="/app/settings" className="text-accent-primary ml-1 hover:underline">Upgrade</a>
              </div>
              <button onClick={logout} className="flex items-center gap-2 mt-2 text-text-muted hover:text-status-danger text-xs w-full py-1.5">
                <LogOut size={14} /> Sign Out
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 flex justify-around py-2">
        {navItems.slice(0, 5).map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center gap-0.5 px-2 py-1 ${isActive ? 'text-accent-primary' : 'text-text-muted'}`}>
            <item.icon size={18} />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40">
          <h2 className="font-display text-lg font-bold text-text-primary">Dashboard</h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-bg-secondary text-text-muted">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-warm" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-bg-secondary rounded-pill px-3 py-1.5">
              <StatusDot active />
              <span className="text-xs font-medium text-status-success">Live</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              RA
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
