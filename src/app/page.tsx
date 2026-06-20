import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#080C14] text-[#E8F0FE]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <nav className="border-b border-[#1E2D42] px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div style={{ background: 'linear-gradient(135deg,#00C2FF,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          className="text-2xl font-black tracking-tight">TradePulse</div>
        <div className="flex items-center gap-6 text-sm text-[#8FA3BF]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          <Link href="/register"
            className="px-4 py-2 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#00C2FF,#0080CC)' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center">
        <div className="inline-block text-[11px] font-bold tracking-[3px] uppercase text-[#00C2FF] border border-[#00C2FF]/30 bg-[#00C2FF]/10 px-4 py-1.5 rounded-full mb-6">
          AI-POWERED TRADING JOURNAL
        </div>
        <h1 className="text-6xl font-black tracking-tight mb-6 leading-none">
          Trade smarter.<br />
          <span style={{ background: 'linear-gradient(135deg,#00C2FF,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Win consistently.
          </span>
        </h1>
        <p className="text-[#8FA3BF] text-lg max-w-2xl mx-auto mb-10">
          The world's most advanced trading journal with AI coaching, Smart Money Concepts tracking,
          and automatic USDT payment activation. Built for serious traders.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register"
            className="px-8 py-4 text-white font-black text-lg rounded-xl hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg,#00C2FF,#0080CC)' }}>
            Start Free — No Card Needed
          </Link>
          <Link href="#pricing"
            className="px-8 py-4 border border-[#1E2D42] rounded-xl font-semibold hover:border-[#2A3F5C] transition-all">
            See Pricing
          </Link>
        </div>
        <p className="text-[#4A6080] text-sm mt-4">Trusted by traders in 40+ countries · Pay Pro with USDT TRC20</p>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3">Everything you need to master trading</h2>
          <p className="text-[#8FA3BF]">From beginner journaling to institutional-grade analytics</p>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {[
            { icon: '🤖', title: 'APEX AI Coach', desc: 'Grades every trade A+ to F. Detects revenge trading, overtrading, and emotional patterns. Weekly AI reports.' },
            { icon: '📊', title: 'Advanced Analytics', desc: 'Win rate, profit factor, expectancy, drawdown, session analysis, and monthly growth tracking.' },
            { icon: '🎯', title: 'SMC Tracker', desc: 'Track Order Blocks, FVGs, BOS, CHOCH, Liquidity Sweeps, Breaker Blocks and all ICT concepts.' },
            { icon: '📥', title: '6 Broker Imports', desc: 'Auto-import from MT4, MT5, Binance, Bybit, Hyperliquid, BingX or any CSV.' },
            { icon: '₮', title: 'USDT Payments', desc: 'Pay with USDT TRC20 only. Blockchain-verified. Auto-activates within seconds of confirmation.' },
            { icon: '🔒', title: 'Enterprise Security', desc: '2FA, JWT auth, rate limiting, encrypted keys, audit logs, and Google OAuth.' },
          ].map(f => (
            <div key={f.title} className="bg-[#0D1420] border border-[#1E2D42] rounded-xl p-6 hover:border-[#2A3F5C] transition-all">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold mb-2">{f.title}</h3>
              <p className="text-[#8FA3BF] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3">Simple, transparent pricing</h2>
          <p className="text-[#8FA3BF]">Pay Pro with 10 USDT TRC20 — activates instantly</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#0D1420] border border-[#1E2D42] rounded-2xl p-8">
            <div className="text-[11px] font-bold text-[#4A6080] uppercase tracking-widest mb-3">Free</div>
            <div className="font-mono text-5xl font-black mb-1">$0</div>
            <div className="text-[#4A6080] text-sm mb-6">Forever free</div>
            {['30 trades/month', 'Basic analytics', 'Trade journal'].map(f => (
              <div key={f} className="flex items-center gap-2 text-[13px] text-[#8FA3BF] mb-2.5">
                <span className="text-[#00E599]">✓</span> {f}
              </div>
            ))}
            <Link href="/register" className="block mt-6 text-center py-3 border border-[#1E2D42] rounded-xl text-sm font-semibold hover:border-[#2A3F5C] transition-all">
              Get Started
            </Link>
          </div>
          <div className="bg-[#0D1420] border-2 border-[#00C2FF] rounded-2xl p-8" style={{ boxShadow: '0 0 40px rgba(0,194,255,0.1)' }}>
            <div className="text-[11px] font-bold text-[#00C2FF] uppercase tracking-widest mb-3">Pro</div>
            <div className="font-mono text-5xl font-black mb-1">$10</div>
            <div className="text-[#00E599] text-sm font-semibold mb-6">₮ Pay 10 USDT TRC20</div>
            {['Unlimited trades', 'AI analysis on every trade', 'APEX AI Coach', 'SMC Tracker', 'All broker imports', 'Weekly AI reports'].map(f => (
              <div key={f} className="flex items-center gap-2 text-[13px] text-[#8FA3BF] mb-2.5">
                <span className="text-[#00C2FF]">✓</span> {f}
              </div>
            ))}
            <Link href="/register"
              className="block mt-6 text-center py-3 rounded-xl text-sm font-black text-black hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg,#FFB800,#CC8800)' }}>
              Get Pro — 10 USDT
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E2D42] mt-16 py-8 text-center text-[#4A6080] text-sm">
        <div style={{ background: 'linear-gradient(135deg,#00C2FF,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          className="font-black text-lg mb-2">TradePulse</div>
        <p>© {new Date().getFullYear()} TradePulse. Built for traders, by traders.</p>
        <p className="mt-1 text-[#2A3F5C]">Payments via USDT TRC20 · Not financial advice</p>
      </footer>
    </main>
  );
}
