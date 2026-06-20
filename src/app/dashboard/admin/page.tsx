'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Users, DollarSign, Shield, Activity, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [tab, setTab] = useState<'overview' | 'users' | 'payments' | 'logs'>('overview');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role !== 'admin') { router.push('/dashboard'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, rRes] = await Promise.all([adminAPI.stats(), adminAPI.revenue()]);
      setStats(sRes.data);
      setRevenue(rRes.data);
    } catch {} finally { setLoading(false); }
  };

  const loadUsers = async () => {
    const res = await adminAPI.users({ search: search || undefined });
    setUsers(res.data.users);
  };

  const loadPayments = async () => {
    const res = await adminAPI.payments();
    setPayments(res.data.payments);
  };

  const loadLogs = async () => {
    const res = await adminAPI.auditLogs();
    setLogs(res.data.logs);
  };

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'payments') loadPayments();
    if (tab === 'logs') loadLogs();
  }, [tab, search]);

  const grantPro = async (userId: string) => {
    await adminAPI.updateUserPlan(userId, 'pro', 30);
    loadUsers();
  };

  const revokePro = async (userId: string) => {
    await adminAPI.updateUserPlan(userId, 'free');
    loadUsers();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 size={20} className="text-accent animate-spin" /></div>;
  }

  const StatCard = ({ icon: Icon, label, value, sub, color = 'text-accent' }: any) => (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center">
          <Icon size={17} className={color} />
        </div>
        <div className="text-[11px] text-text-muted font-semibold uppercase tracking-wide">{label}</div>
      </div>
      <div className={`text-3xl font-black font-mono ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-text-muted mt-1">{sub}</div>}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center">
          <Shield size={18} className="text-purple" />
        </div>
        <div>
          <h1 className="text-xl font-black">Admin Panel</h1>
          <p className="text-text-muted text-sm">Platform management and monitoring</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-elevated rounded-xl p-1 mb-6 w-fit">
        {(['overview', 'users', 'payments', 'logs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-[12px] font-semibold capitalize transition-all ${
              tab === t ? 'bg-bg-card text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}>{t}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <StatCard icon={Users} label="Total Users" value={stats.users?.total || 0}
              sub={`+${stats.users?.new_this_month || 0} this month`} color="text-accent" />
            <StatCard icon={DollarSign} label="MRR (USDT)" value={`$${stats.mrr_usdt || 0}`}
              sub={`${stats.subscriptions?.pro || 0} Pro subscribers`} color="text-gold" />
            <StatCard icon={Activity} label="Total Trades" value={stats.trades?.total || 0}
              sub={`${stats.trades?.this_week || 0} this week`} color="text-success" />
          </div>
          {revenue && (
            <div className="grid grid-cols-3 gap-4 mb-5">
              <StatCard icon={DollarSign} label="Total Revenue" value={`${revenue.total_usdt || 0} USDT`}
                sub={`${revenue.total_payments || 0} payments`} color="text-purple" />
              <StatCard icon={CheckCircle} label="This Month" value={`${revenue.this_month_usdt || 0} USDT`}
                sub={`${revenue.this_month_payments || 0} payments`} color="text-success" />
              <StatCard icon={Users} label="Active Pro" value={revenue.active_pro_users || 0}
                sub="Paying subscribers" color="text-accent" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <div className="text-sm font-bold mb-3">Plan Distribution</div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-text-secondary">Pro</span>
                    <span className="text-gold font-mono">{stats.subscriptions?.pro || 0}</span>
                  </div>
                  <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full" style={{ width: `${Math.min(100, ((stats.subscriptions?.pro || 0) / (stats.users?.total || 1)) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-text-secondary">Free</span>
                    <span className="text-text-muted font-mono">{stats.subscriptions?.free || 0}</span>
                  </div>
                  <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-border-bright rounded-full" style={{ width: `${Math.min(100, ((stats.subscriptions?.free || 0) / (stats.users?.total || 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <div className="text-sm font-bold mb-3">Support</div>
              <div className="text-3xl font-black font-mono text-danger">{stats.support?.open || 0}</div>
              <div className="text-[11px] text-text-muted mt-1">Open tickets</div>
            </div>
          </div>
        </>
      )}

      {/* Users */}
      {tab === 'users' && (
        <>
          <div className="relative mb-4 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
              className="w-full bg-bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:border-accent focus:outline-none text-text-primary" />
          </div>
          <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['User', 'Email', 'Plan', 'Trades', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] text-text-muted font-semibold uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border/40 hover:bg-bg-elevated/50">
                    <td className="px-4 py-3 text-[13px] font-semibold">{u.name}</td>
                    <td className="px-4 py-3 text-[12px] text-text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.plan === 'pro' ? 'bg-gold/10 text-gold' : 'bg-border text-text-muted'
                      }`}>{u.plan?.toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px]">{u.trade_count}</td>
                    <td className="px-4 py-3 text-[11px] text-text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {u.plan !== 'pro' ? (
                          <button onClick={() => grantPro(u.id)}
                            className="text-[10px] text-success hover:underline">Grant Pro</button>
                        ) : (
                          <button onClick={() => revokePro(u.id)}
                            className="text-[10px] text-danger hover:underline">Revoke</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Payments */}
      {tab === 'payments' && (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-semibold">Live USDT Transaction Monitor</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['User', 'TX Hash', 'Amount', 'Status', 'Confirmations', 'Time'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] text-text-muted font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-border/40 hover:bg-bg-elevated/50">
                  <td className="px-4 py-3 text-[12px]">{p.email}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-accent">
                    {p.tx_hash ? `${p.tx_hash.slice(0, 10)}...${p.tx_hash.slice(-6)}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] font-bold text-success">
                    {p.amount_usdt} USDT
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.status === 'confirmed' ? 'bg-success/10 text-success' :
                      p.status === 'detecting' ? 'bg-accent/10 text-accent' :
                      p.status === 'expired' ? 'bg-danger/10 text-danger' : 'bg-gold/10 text-gold'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px]">{p.confirmations || 0}/{p.required_confirmations}</td>
                  <td className="px-4 py-3 text-[11px] text-text-muted">{new Date(p.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-text-muted text-sm">No payments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Logs */}
      {tab === 'logs' && (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Time', 'User', 'Action', 'IP'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] text-text-muted font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b border-border/40 hover:bg-bg-elevated/50">
                  <td className="px-4 py-3 text-[11px] text-text-muted font-mono">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[12px]">{l.email || 'Guest'}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-accent">{l.action}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-text-muted">{l.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
