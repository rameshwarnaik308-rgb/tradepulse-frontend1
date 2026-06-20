'use client';
import { useState, useEffect } from 'react';
import { smcAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Plus, Layers, Lock } from 'lucide-react';
import Link from 'next/link';

const CONCEPTS = [
  { value: 'order_block', label: 'Order Block', color: 'text-success bg-success/10 border-success/20' },
  { value: 'breaker_block', label: 'Breaker Block', color: 'text-purple bg-purple/10 border-purple/20' },
  { value: 'fair_value_gap', label: 'Fair Value Gap', color: 'text-accent bg-accent/10 border-accent/20' },
  { value: 'liquidity_sweep', label: 'Liquidity Sweep', color: 'text-danger bg-danger/10 border-danger/20' },
  { value: 'bos', label: 'BOS', color: 'text-success bg-success/10 border-success/20' },
  { value: 'choch', label: 'CHOCH', color: 'text-gold bg-gold/10 border-gold/20' },
  { value: 'cisd', label: 'CISD', color: 'text-accent bg-accent/10 border-accent/20' },
  { value: 'swing_high', label: 'Swing High', color: 'text-success bg-success/10 border-success/20' },
  { value: 'swing_low', label: 'Swing Low', color: 'text-danger bg-danger/10 border-danger/20' },
  { value: 'market_structure_shift', label: 'MSS', color: 'text-purple bg-purple/10 border-purple/20' },
];

const TIMEFRAMES = ['1M', '5M', '15M', '1H', '4H', 'Daily', 'Weekly'];
const PAIRS = ['XAU/USD', 'US100', 'EUR/USD', 'BTC/USDT', 'ETH/USDT', 'GBP/USD'];

export default function SMCPage() {
  const { user } = useAuthStore();
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterConcept, setFilterConcept] = useState('');
  const [filterPair, setFilterPair] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');

  const [form, setForm] = useState({
    pair: 'XAU/USD', timeframe: '4H', concept: 'order_block',
    price_level: '', price_high: '', price_low: '',
    direction: 'bullish', notes: '',
  });

  if (user?.plan !== 'pro') {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
            <Layers size={24} className="text-accent" />
          </div>
          <h2 className="text-xl font-black mb-2">SMC Tracker is Pro only</h2>
          <p className="text-text-muted text-sm mb-5">
            Track all Smart Money Concepts — Order Blocks, FVGs, BOS, CHOCH, liquidity sweeps and more.
          </p>
          <Link href="/dashboard/pricing"
            className="inline-block px-6 py-3 bg-gradient-to-r from-gold to-[#CC8800] text-black font-black rounded-xl">
            Upgrade — 10 USDT
          </Link>
        </div>
      </div>
    );
  }

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await smcAPI.list({
        concept: filterConcept || undefined,
        pair: filterPair || undefined,
        status: filterStatus || undefined,
      });
      setLevels(res.data.levels);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filterConcept, filterPair, filterStatus]);

  const save = async (e: any) => {
    e.preventDefault();
    try {
      await smcAPI.create({
        ...form,
        price_level: parseFloat(form.price_level),
        price_high: form.price_high ? parseFloat(form.price_high) : undefined,
        price_low: form.price_low ? parseFloat(form.price_low) : undefined,
      });
      setShowModal(false);
      fetch();
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const updateStatus = async (id: string, status: string) => {
    await smcAPI.updateStatus(id, status);
    fetch();
  };

  const conceptStyle = (c: string) => CONCEPTS.find(x => x.value === c)?.color || 'text-text-muted';
  const conceptLabel = (c: string) => CONCEPTS.find(x => x.value === c)?.label || c;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black">SMC Tracker</h1>
          <p className="text-text-muted text-sm mt-0.5">Track Smart Money Concepts across your instruments</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-[#0080CC] text-white text-sm font-bold rounded-xl">
          <Plus size={15} /> Add Level
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={filterConcept} onChange={e => setFilterConcept(e.target.value)}
          className="bg-bg-card border border-border rounded-xl px-3 py-2 text-sm text-text-secondary focus:border-accent focus:outline-none">
          <option value="">All Concepts</option>
          {CONCEPTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={filterPair} onChange={e => setFilterPair(e.target.value)}
          className="bg-bg-card border border-border rounded-xl px-3 py-2 text-sm text-text-secondary focus:border-accent focus:outline-none">
          <option value="">All Pairs</option>
          {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-bg-card border border-border rounded-xl px-3 py-2 text-sm text-text-secondary focus:border-accent focus:outline-none">
          <option value="active">Active</option>
          <option value="mitigated">Mitigated</option>
          <option value="invalidated">Invalidated</option>
          <option value="">All</option>
        </select>
      </div>

      {/* Concept summary cards */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {CONCEPTS.slice(0, 5).map(c => {
          const count = levels.filter(l => l.concept === c.value).length;
          return (
            <button key={c.value} onClick={() => setFilterConcept(filterConcept === c.value ? '' : c.value)}
              className={`bg-bg-card border rounded-xl p-3 text-left transition-all ${
                filterConcept === c.value ? 'border-accent/40 bg-accent/5' : 'border-border hover:border-border-bright'
              }`}>
              <div className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border inline-block ${c.color}`}>
                {c.label}
              </div>
              <div className="font-mono text-2xl font-black mt-2">{count}</div>
              <div className="text-[10px] text-text-muted">active</div>
            </button>
          );
        })}
      </div>

      {/* Levels table */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Concept', 'Pair', 'TF', 'Level', 'Range', 'Direction', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] text-text-muted font-semibold uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {levels.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-text-muted text-sm">No levels tracked yet. Add your first SMC level.</td></tr>
            )}
            {levels.map(l => (
              <tr key={l.id} className="border-b border-border/40 hover:bg-bg-elevated/50 transition-all">
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${conceptStyle(l.concept)}`}>
                    {conceptLabel(l.concept)}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] font-bold">{l.pair}</td>
                <td className="px-4 py-3 text-[11px] text-text-muted">{l.timeframe}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-accent">{l.price_level}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-text-muted">
                  {l.price_low && l.price_high ? `${l.price_low} — ${l.price_high}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold ${
                    l.direction === 'bullish' ? 'text-success' : l.direction === 'bearish' ? 'text-danger' : 'text-gold'
                  }`}>
                    {l.direction === 'bullish' ? '▲' : l.direction === 'bearish' ? '▼' : '—'} {l.direction}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    l.status === 'active' ? 'bg-success/10 text-success' :
                    l.status === 'mitigated' ? 'bg-gold/10 text-gold' : 'bg-danger/10 text-danger'
                  }`}>{l.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {l.status === 'active' && (
                      <>
                        <button onClick={() => updateStatus(l.id, 'mitigated')}
                          className="text-[10px] text-gold hover:underline">Mitigated</button>
                        <span className="text-text-muted">·</span>
                        <button onClick={() => updateStatus(l.id, 'invalidated')}
                          className="text-[10px] text-danger hover:underline">Invalidated</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-bg-deep/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-black">Add SMC Level</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted">✕</button>
            </div>
            <form onSubmit={save} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wide block mb-1">Pair</label>
                  <input list="smc-pairs" value={form.pair} onChange={e => setForm(f => ({ ...f, pair: e.target.value }))}
                    className="w-full bg-bg-deep border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary focus:border-accent focus:outline-none" required />
                  <datalist id="smc-pairs">{PAIRS.map(p => <option key={p} value={p} />)}</datalist>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wide block mb-1">Timeframe</label>
                  <select value={form.timeframe} onChange={e => setForm(f => ({ ...f, timeframe: e.target.value }))}
                    className="w-full bg-bg-deep border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary focus:border-accent focus:outline-none">
                    {TIMEFRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wide block mb-1">Concept</label>
                <select value={form.concept} onChange={e => setForm(f => ({ ...f, concept: e.target.value }))}
                  className="w-full bg-bg-deep border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary focus:border-accent focus:outline-none">
                  {CONCEPTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['price_level', 'price_high', 'price_low'].map(field => (
                  <div key={field}>
                    <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wide block mb-1">
                      {field === 'price_level' ? 'Mid/Key Level' : field === 'price_high' ? 'High' : 'Low'}
                    </label>
                    <input type="number" step="any" value={(form as any)[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      required={field === 'price_level'}
                      className="w-full bg-bg-deep border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary focus:border-accent focus:outline-none" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wide block mb-1">Direction</label>
                <select value={form.direction} onChange={e => setForm(f => ({ ...f, direction: e.target.value }))}
                  className="w-full bg-bg-deep border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary focus:border-accent focus:outline-none">
                  <option value="bullish">▲ Bullish</option>
                  <option value="bearish">▼ Bearish</option>
                  <option value="neutral">— Neutral</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wide block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  placeholder="e.g. Unmitigated OB from Monday's Asia session..."
                  className="w-full bg-bg-deep border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary focus:border-accent focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm text-text-muted">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-accent to-[#0080CC] text-white text-sm font-bold rounded-xl">
                  Save Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
