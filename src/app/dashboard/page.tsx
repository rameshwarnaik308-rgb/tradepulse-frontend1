'use client';
import { useEffect, useState } from 'react';
import { analyticsAPI, aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const StatCard = ({ label, value, sub, color, prefix = '' }: any) => (
  <div className={`bg-bg-card border border-border rounded-xl p-5 relative overflow-hidden`}>
    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-${color}`} />
    <div className="text-[11px] text-text-muted font-semibold uppercase tracking-wide">{label}</div>
    <div className={`text-3xl font-black mt-2 mb-1 font-mono text-${color} tracking-tight`}>
      {prefix}{value}
    </div>
    <div className="text-[11px] text-text-muted">{sub}</div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.dashboard(30),
      user?.plan === 'pro' ? aiAPI.patterns() : Promise.resolve({ data: { patterns: [] } }),
    ]).then(([res, pRes]) => {
      setData(res.data);
      setPatterns(pRes.data.patterns || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-accent animate-pulse font-mono text-sm">Loading dashboard...</div>
      </div>
    );
  }

  const s = data?.summary || {};
  const equity = data?.equityCurve || [];
  const sessions = data?.sessions || [];
  const instruments = data?.instruments || [];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-text-muted text-sm mt-0.5">Here's your trading overview for the last 30 days</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/trades/new"
            className="px-4 py-2 bg-gradient-to-r from-accent to-[#0080CC] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all">
            + Add Trade
          </Link>
        </div>
      </div>

      {/* AI Patterns alert */}
      {patterns.filter(p => p.severity === 'high').length > 0 && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-danger">AI Alert — Behaviour Pattern Detected</div>
            <div className="text-sm text-text-secondary mt-0.5">{patterns[0].message}</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Win Rate" value={`${s.winRate || 0}%`} color="success"
          sub={`${s.wins || 0}W / ${s.losses || 0}L`} />
        <StatCard label="Profit Factor" value={s.profitFactor || '0'} color="accent"
          sub={`Expectancy: ${s.expectancy || 0}R`} />
        <StatCard label="Net P&L" value={`$${Math.abs(s.netPnl || 0).toFixed(0)}`}
          prefix={s.netPnl >= 0 ? '+' : '-'} color={s.netPnl >= 0 ? 'gold' : 'danger'}
          sub={`${s.totalTrades || 0} closed trades`} />
        <StatCard label="Max Drawdown" value={`${s.maxDrawdown || 0}%`} color="danger"
          sub={`Avg R: ${s.avgR?.toFixed(2) || 0}`} />
      </div>

      {/* Equity Curve */}
      {equity.length > 0 && (
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold">Equity Curve</div>
            <div className={`text-sm font-mono font-bold ${s.netPnl >= 0 ? 'text-success' : 'text-danger'}`}>
              {s.netPnl >= 0 ? '+' : ''}${(s.netPnl || 0).toFixed(2)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={equity}>
              <defs>
                <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00C2FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: '#4A6080', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4A6080', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#0D1420', border: '1px solid #1E2D42', borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [`$${parseFloat(v).toFixed(2)}`, 'Cum. P&L']}
                labelFormatter={formatDate}
              />
              <Area type="monotone" dataKey="cumulative_pnl" stroke="#00C2FF" strokeWidth={2} fill="url(#eq)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Sessions */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-bold mb-4">Performance by Session</div>
          <div className="space-y-3">
            {sessions.length === 0 && <p className="text-text-muted text-sm">No session data yet</p>}
            {sessions.map((s: any) => {
              const wr = s.total > 0 ? ((s.wins / s.total) * 100).toFixed(0) : 0;
              const color = parseFloat(s.pnl) >= 0 ? '#00E599' : '#FF4D6A';
              return (
                <div key={s.session}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="capitalize text-text-secondary">{s.session || 'Unknown'}</span>
                    <span style={{ color }} className="font-mono font-semibold">
                      {parseFloat(s.pnl) >= 0 ? '+' : ''}${parseFloat(s.pnl).toFixed(0)} ({wr}% WR)
                    </span>
                  </div>
                  <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${wr}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instruments */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-bold mb-4">Top Instruments</div>
          <div className="space-y-3">
            {instruments.length === 0 && <p className="text-text-muted text-sm">No instrument data yet</p>}
            {instruments.slice(0, 5).map((inst: any) => {
              const wr = inst.total > 0 ? ((inst.wins / inst.total) * 100).toFixed(0) : 0;
              const pnl = parseFloat(inst.pnl);
              return (
                <div key={inst.pair} className="flex items-center gap-3">
                  <div className="font-mono text-[12px] font-bold w-20 text-text-primary">{inst.pair}</div>
                  <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${wr}%` }} />
                  </div>
                  <div className={`font-mono text-[11px] font-bold w-16 text-right ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Best Trade', value: `$${(s.bestTrade || 0).toFixed(0)}`, color: 'text-success' },
          { label: 'Worst Trade', value: `$${(s.worstTrade || 0).toFixed(0)}`, color: 'text-danger' },
          { label: 'Avg Win', value: `$${(s.avgWin || 0).toFixed(0)}`, color: 'text-accent' },
          { label: 'Avg Loss', value: `$${(s.avgLoss || 0).toFixed(0)}`, color: 'text-text-secondary' },
        ].map(item => (
          <div key={item.label} className="bg-bg-card border border-border rounded-lg p-4">
            <div className="text-[11px] text-text-muted">{item.label}</div>
            <div className={`text-lg font-black font-mono mt-1 ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Pro upsell for free users */}
      {user?.plan === 'free' && (
        <div className="bg-gradient-to-r from-accent/10 to-purple/10 border border-accent/20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="font-bold">Unlock AI Analysis & SMC Tracking</div>
            <div className="text-text-secondary text-sm mt-1">
              Get trade grades, weekly AI reports, and Smart Money Concepts tracking
            </div>
          </div>
          <Link href="/dashboard/pricing"
            className="flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-gold to-[#CC8800] text-black text-sm font-bold rounded-lg hover:opacity-90">
            Go Pro — 10 USDT
          </Link>
        </div>
      )}
    </div>
  );
}
