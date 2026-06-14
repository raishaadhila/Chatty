import { Card, GradientButton } from '../components/shared/ui';

export default function Settings() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-xl font-bold text-text-primary mb-6">Settings</h2>
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Business Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1">Business Name</label>
              <input className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/40" defaultValue="Toko Aisyah Fashion" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-1">Brand Tone</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/40">
                  <option>Friendly</option>
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Formal</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-1">Language</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/40">
                  <option>Bahasa & English</option>
                  <option>Bahasa Indonesia</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Notifications</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1">Owner Email</label>
              <input type="email" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/40" defaultValue="raisha@bisnis.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1">WhatsApp Number</label>
              <input type="tel" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/40" defaultValue="+628123456789" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1">Report Schedule</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/40">
                <option>Morning only</option>
                <option>Morning & Evening</option>
                <option>Evening only</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Connected Channels</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary">
              <div>
                <p className="text-sm font-medium text-text-primary">WhatsApp Business</p>
                <p className="text-xs text-text-muted">Connected</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-status-success" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary">
              <div>
                <p className="text-sm font-medium text-text-primary">Telegram</p>
                <p className="text-xs text-text-muted">Connected</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-status-success" />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <GradientButton className="text-sm">Save Changes</GradientButton>
        </div>
      </div>
    </div>
  );
}
