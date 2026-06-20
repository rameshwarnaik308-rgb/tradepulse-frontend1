'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, LineChart, BookOpen, Layers, Bot,
  Zap, Settings, LogOut, Bell, ChevronRight, Shield,
  BarChart3, Upload, Users
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, section: 'Overview' },
  { href: '/dashboard/trades', label: 'Trade Journal', icon: BookOpen, section: 'Trading' },
  { href: '/dashboard/smc', label: 'SMC Tracker', icon: Layers, section: 'Trading', pro: true },
  { href: '/dashboard/ai', label: 'AI Coach', icon: Bot, section: 'Trading', pro: true },
  { href: '/dashboard/import', label: 'Import Trades', icon: Upload, section: 'Trading' },
  { href: '/dashboard/pricing', label: 'Upgrade Plan', icon: Zap, section: 'Account' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, section: 'Account' },
];

const adminItems = [
  { href: '/dashboard/admin', label: 'Admin Panel', icon: Shield },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, initialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initialized && !user) router.replace('/login');
  }, [user, initialized]);

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-deep">
        <div className="text-accent animate-pulse font-mono text-sm">Loading TradePulse...</div>
      </div>
    );
  }

  const sections = [...new Set(navItems.map(i => i.section))];
  const tradeLimit = user.trade_count_this_month || 0;
  const tradePercent = Math.min(100, (tradeLimit / 30) * 100);

  return (
    <div className="flex h-screen bg-bg-deep overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-[220px] flex-shrink-0 bg-bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-border">
          <div className="gradient-text text-lg font-black tracking-tight">TradePulse</div>
          <div className="text-text-muted text-[10px] font-mono mt-0.5">AI TRADING JOURNAL</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
          {sections.map(section => (
            <div key={section}>
              <div className="text-[10px] text-text-muted font-semibold uppercase tracking-widest px-2 mb-1">
                {section}
              </div>
              {navItems.filter(i => i.section === section).map(item => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] mb-0.5 transition-all ${
                      active
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }`}>
                    <Icon size={15} className="flex-shrink-0" />
                    {item.label}
                    {item.pro && user.plan !== 'pro' && (
                      <span className="ml-auto text-[9px] bg-accent text-black font-bold px-1.5 py-0.5 rounded-full">PRO</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {user.role === 'admin' && (
            <div>
              <div className="text-[10px] text-text-muted font-semibold uppercase tracking-widest px-2 mb-1">Admin</div>
              {adminItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] mb-0.5 transition-all ${
                      pathname === item.href ? 'bg-purple/10 text-purple border border-purple/20' : 'text-text-secondary hover:bg-bg-hover'
                    }`}>
                    <Icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-2">
          {user.plan === 'free' ? (
            <div className="bg-gold/10 border border-gold/25 rounded-lg p-3">
              <div className="text-[11px] font-bold text-gold">FREE PLAN</div>
              <div className="text-[11px] text-text-muted mt-0.5">{tradeLimit} / 30 trades</div>
              <div className="mt-1.5 h-1 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${tradePercent}%` }} />
              </div>
              <Link href="/dashboard/pricing"
                className="block mt-2 text-center text-[11px] font-bold py-1.5 rounded-md bg-gradient-to-r from-accent to-purple text-white">
                Upgrade to Pro
              </Link>
            </div>
          ) : (
            <div className="bg-success/10 border border-success/25 rounded-lg p-3">
              <div className="text-[11px] font-bold text-success">⚡ PRO PLAN</div>
              <div className="text-[11px] text-text-muted mt-0.5">Unlimited trades</div>
            </div>
          )}
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-text-muted hover:text-danger hover:bg-danger/10 transition-all">
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-border bg-bg-card flex items-center px-6 gap-3 flex-shrink-0">
          <div className="flex-1" />
          <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all relative">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple flex items-center justify-center text-[12px] font-bold text-white">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="hidden md:block">
              <div className="text-[12px] font-semibold">{user.name}</div>
              <div className="text-[10px] text-text-muted">{user.plan === 'pro' ? '⚡ Pro' : 'Free'}</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
