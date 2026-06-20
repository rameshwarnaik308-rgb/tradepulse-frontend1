'use client';
import { useState, useEffect, useCallback } from 'react';
import { tradesAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Plus, Search, Filter, Loader2, TrendingUp, TrendingDown, Bot } from 'lucide-react';

const GRADE_STYLE: Record<string, string> = {
  'A+': 'bg-success/10 text-success border-success/20',
  'A':  'bg-success/10 text-success border-success/20',
  'B+': 'bg-accent/10 text-accent border-accent/20',
  'B':  'bg-accent/10 text-accent border-accent/20',
  'C':  'bg-gold/10 text-gold border-gold/20',
  'D':  'bg-danger/10 text-danger border-danger/20',
  'F':  'bg-danger/10 text-danger border-danger/20',
};

const PAIRS = ['XAU/USD', 'US100', 'EUR/USD', 'GBP/USD', 'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'NAS100'];
const SESSIONS = ['asia', 'london', 'new_york', 'overlap'];

export default function TradesPage() {
  const { user } = useAuthStore();
  const [trades, setTrades] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDir, setFilterDir] = useState('');
  const [filterStatus, setFilterStatus] = useState('closed');
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const [form, setForm] = useState({
    pair: '', direction: 'long', asset_class: 'forex',
    entry_price: '', exit_price: '', stop_loss: '', take_profit: '',
    position_size: '', risk_amount: '', pnl: '', r_multiple: '',
    status: 'closed', entry_time: '', exit_time: '',
    session: '', strategy: '', setup_type: '', tags: '',
  });

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tradesAPI.list({
        search: search || undefined,
        direction: filterDir || undefined,
        status: filterStatus || undefined,
        limit: 50,
      });
      setTrades(res.data.trades);
      setTotal(res.data.total);
    } catch {}
    finally { setLoading(false); }
  }, [search, filterDir, filterStatus]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const submitTrade = async (e: any) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        entry_price: parseFloat(form.entry_price),
        exit_price: form.exit_price ? parseFloat(form.exit_price) : undefined,
        stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : undefined,
        take_profit: form.take_profit ? parseFloat(form.take_profit) : undefined,
        position_size: form.position_size ? parseFloat(form.position_size) : undefined,
        risk_amount: form.risk_amount ? parseFloat(form.risk_amount) : undefined,
        pnl: form.pnl ? parseFloat(form.pnl) : undefined,
        r_multiple: form.r_multiple ? parseFloat(form.r_multiple) : undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      await tradesAPI.create(payload);
      setShowModal(false);
      setForm({ pair: '', direction: 'long', asset_class: 'forex', entry_price: '', exit_price: '',
        stop_loss: '', take_profit: '', position_size: '', risk_amount: '', pnl: '',
        r_multiple: '', status: 'closed', entry_time: '', exit_time: '', session: '', strategy: '', setup_type: '', tags: '' });
      fetchTrades();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save trade');
    }
  };

  const analyze = async (id: string) => {
    if (user?.plan !== 'pro') return alert('AI analysis requires Pro plan');
    setAnalyzing(id);
    try {
      await tradesAPI.analyze(id);
      await fetchTrades();
    } catch { alert('Analysis failed'); }
    finally { setAnalyzing(null); }
  };

  const Input = ({ label, name, type = 'text', ...rest }: any) => (
    <div>
      <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wide block mb-1">{label}</label>
      <input
        type={type} name={name} value={(form as any)[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        className="w-full bg-bg-deep border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
        {...rest}
      />
    </div>
  );

  const Select = ({ label, name, options }: any) => (
    <div>
      <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wide block mb-1">{label}</label>
      <select
        value={(form as any)[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        className="w-full bg-bg-deep border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary focus:border-accent focus:outline-none">
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black">Trade Journal</h1>
          <p className="text-text-muted text-sm mt-0.5">{total} trades total</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-[#0080CC] text-white text-sm font-bold rounded-xl hover:opacity-90">
          <Plus size={15} /> Add Trade
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search pair, strategy..."
            className="w-full bg-bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none" />
        </div>
        <select value={filterDir} onChange={e => setFilterDir(e.target.value)}
          className="bg-bg-card border border-border rounded-xl px-3 py-2 text-sm text-text-secondary focus:border-accent focus:outline-none">
          <option value="">All Directions</option>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-bg-card border border-border rounded-xl px-3 py-2 text-sm text-text-secondary focus:border-accent focus:outline-none">
          <option value="closed">Closed</option>
          <option value="open">Open</option>
          <option value="">All</option>
        </select>
      </div>

      {/* Trade table */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={20} className="text-accent animate-spin" />
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg mb-2">No trades yet</p>
            <p className="text-sm">Add your first trade or import from your broker</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Pair', 'Dir', 'Entry', 'Exit', 'P&L', 'R', 'Session', 'Grade', 'AI'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] text-text-muted font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map(t => {
                const pnl = parseFloat(t.pnl) || 0;
                return (
                  <tr key={t.id} className="border-b border-border/40 hover:bg-bg-elevated/50 transition-all">
                    <td className="px-5 py-3 font-mono text-[13px] font-bold">{t.pair}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                        t.direction === 'long' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                      }`}>
                        {t.direction === 'long' ? '▲' : '▼'} {t.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px] text-text-secondary">{t.entry_price}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-text-secondary">{t.exit_price || '—'}</td>
                    <td className={`px-5 py-3 font-mono text-[13px] font-bold ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px]">
                      {t.r_multiple ? `${t.r_multiple}R` : '—'}
                    </td>
                    <td className="px-5 py-3 text-[11px] text-text-muted capitalize">{t.session || '—'}</td>
                    <td className="px-5 py-3">
                      {t.ai_grade ? (
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded border ${GRADE_STYLE[t.ai_grade] || 'text-text-muted'}`}>
                          {t.ai_grade}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {user?.plan === 'pro' && !t.ai_grade ? (
                        <button onClick={() => analyze(t.id)}
                          disabled={analyzing === t.id}
                          className="text-[10px] flex items-center gap-1 text-accent hover:text-accent/80 transition-all">
                          {analyzing === t.id ? <Loader2 size={11} className="animate-spin" /> : <Bot size={11} />}
                          Analyze
                        </button>
                      ) : t.ai_analysis ? (
                        <span className="text-[10px] text-success">✓ Done</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Trade Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-bg-deep/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-black">Add Trade</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>
            <form onSubmit={submitTrade} className="p-5">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="col-span-1">
                  <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wide block mb-1">Pair</label>
                  <input
                    list="pairs-list" value={form.pair} onChange={e => setForm(f => ({ ...f, pair: e.target.value }))}
                    className="w-full bg-bg-deep border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary focus:border-accent focus:outline-none"
                    placeholder="XAU/USD" required />
                  <datalist id="pairs-list">
                    {PAIRS.map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>
                <Select label="Direction" name="direction" options={[{ value: 'long', label: '▲ Long' }, { value: 'short', label: '▼ Short' }]} />
                <Select label="Asset Class" name="asset_class" options={[
                  { value: 'forex', label: 'Forex' },
                  { value: 'crypto', label: 'Crypto' },
                  { value: 'futures', label: 'Futures' },
                  { value: 'stocks', label: 'Stocks' },
                  { value: 'options', label: 'Options' },
                ]} />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Input label="Entry Price" name="entry_price" type="number" step="any" required />
                <Input label="Exit Price" name="exit_price" type="number" step="any" />
                <Input label="P&L ($)" name="pnl" type="number" step="any" />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Input label="Stop Loss" name="stop_loss" type="number" step="any" />
                <Input label="Take Profit" name="take_profit" type="number" step="any" />
                <Input label="R Multiple" name="r_multiple" type="number" step="any" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input label="Entry Time" name="entry_time" type="datetime-local" />
                <Input label="Exit Time" name="exit_time" type="datetime-local" />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Select label="Session" name="session" options={[
                  { value: '', label: 'Unknown' },
                  ...SESSIONS.map(s => ({ value: s, label: s.replace('_', ' ').toUpperCase() }))
                ]} />
                <Input label="Strategy" name="strategy" placeholder="e.g. Order Block" />
                <Input label="Setup Type" name="setup_type" placeholder="e.g. BOS + OB" />
              </div>
              <Input label="Tags (comma-separated)" name="tags" placeholder="OB, FVG, London Open" />
              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm text-text-muted hover:text-text-primary transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-accent to-[#0080CC] text-white text-sm font-bold rounded-xl hover:opacity-90">
                  Save Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
