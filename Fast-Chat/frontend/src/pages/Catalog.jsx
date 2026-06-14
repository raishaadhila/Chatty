import { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, RefreshCw, Package } from 'lucide-react';
import { Card, Badge } from '../components/shared/ui';
import { api } from '../lib/api';

export default function Catalog() {
  const [items, setItems] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    api('/dashboard/catalog').then(setItems).catch(() => {});
    setLastSync(new Date().toLocaleTimeString('id-ID'));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-text-primary">Product Catalog</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-300 text-text-secondary hover:bg-slate-50 font-medium rounded-pill px-4 py-2 text-sm transition-all">
            <Upload size={16} /> Upload CSV
          </button>
          <button className="flex items-center gap-2 bg-white border border-slate-300 text-text-secondary hover:bg-slate-50 font-medium rounded-pill px-4 py-2 text-sm transition-all">
            <LinkIcon size={16} /> Connect Sheets
          </button>
        </div>
      </div>
      {lastSync && (
        <p className="text-xs text-text-muted mb-4 flex items-center gap-1.5">
          <RefreshCw size={12} /> Last synced {lastSync}
        </p>
      )}
      <Card>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Package size={40} className="mx-auto mb-3 text-text-muted/40" />
            <p className="text-text-muted">No products yet. Upload a CSV or connect Google Sheets.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">SKU</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Price</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Stock</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item, i) => (
                <tr key={i} className="hover:bg-bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-text-muted">{item.sku || '-'}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">Rp {Number(item.price || 0).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.stock > 5 ? 'success' : item.stock > 0 ? 'warning' : 'danger'}>
                      {item.stock > 5 ? `${item.stock} in stock` : item.stock > 0 ? `Only ${item.stock}` : 'Out of stock'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{item.category || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
