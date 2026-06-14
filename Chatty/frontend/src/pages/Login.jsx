import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { Sparkles } from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [business, setBusiness] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!business) { setError('Business name is required'); setLoading(false); return; }
        const res = await api('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ email, password, businessName: business }),
        });
        if (res.error) { setError(res.error); setLoading(false); return; }
        localStorage.setItem('chatty_token', res.token);
        localStorage.setItem('chatty_ws', res.workspaceId);
        window.location.href = res.onboarding?.currentStep !== 'completed' ? '/onboarding' : '/app';
      } else {
        const res = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        if (res.error) { setError(res.error); setLoading(false); return; }
        localStorage.setItem('chatty_token', res.token);
        localStorage.setItem('chatty_ws', res.workspaceId);
        window.location.href = res.onboarding?.currentStep !== 'completed' ? '/onboarding' : '/app';
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Chatty<span className="text-accent-primary">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">AI Customer Service Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-status-danger/5 border border-status-danger/10 rounded-lg px-4 py-3 text-status-danger text-sm">{error}</div>
          )}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1.5">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all" />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1.5">Business Name</label>
              <input type="text" required value={business} onChange={e => setBusiness(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all" />
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-hero text-white font-semibold rounded-pill py-3 transition-all hover:shadow-glow-primary disabled:opacity-60">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-text-muted">
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => setMode('signup')} className="text-accent-primary font-medium hover:underline">Sign Up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode('login')} className="text-accent-primary font-medium hover:underline">Sign In</button></>
          )}
        </div>
      </motion.div>
    </div>
  );
}
