'use client';
import { useState, useEffect, useRef } from 'react';
import { paymentsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Check, X, Copy, CheckCircle, Loader2, Clock } from 'lucide-react';

const features = {
  free: [
    { text: '30 trades per month', ok: true },
    { text: 'Basic analytics', ok: true },
    { text: 'Trade journal (limited)', ok: true },
    { text: 'AI trade analysis', ok: false },
    { text: 'SMC Tracker', ok: false },
    { text: 'AI Coach (chat)', ok: false },
    { text: 'Broker integrations', ok: false },
    { text: 'Weekly/monthly reports', ok: false },
  ],
  pro: [
    { text: 'Unlimited trades', ok: true },
    { text: 'AI analysis on every trade (A+ to F)', ok: true },
    { text: 'SMC Tracker (OB, FVG, BOS, CHOCH...)', ok: true },
    { text: 'APEX AI Coach (daily chat)', ok: true },
    { text: 'MT4/MT5/Binance/Bybit/Hyperliquid import', ok: true },
    { text: 'Advanced analytics + psychology', ok: true },
    { text: 'Weekly & monthly AI reports', ok: true },
    { text: 'Chart screenshot uploads', ok: true },
  ],
};

export default function PricingPage() {
  const { user } = useAuthStore();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState('');
  const [pollStatus, setPollStatus] = useState<string>('');
  const pollRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const startPayment = async () => {
    setLoading(true);
    try {
      const res = await paymentsAPI.create();
      setPaymentData(res.data);
      startPolling(res.data.paymentRequestId);
      startTimer(new Date(res.data.expiresAt));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (expiresAt: Date) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimer(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      if (diff === 0) clearInterval(timerRef.current);
    }, 1000);
  };

  const startPolling = (id: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await paymentsAPI.status(id);
        const st = res.data;
        setPollStatus(st.statusLabel);
        if (st.status === 'confirmed') {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          window.location.href = '/dashboard?upgraded=1';
        } else if (st.status === 'expired' || st.status === 'failed') {
          clearInterval(pollRef.current);
        }
      } catch {}
    }, 8000);
  };

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(paymentData.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (user?.plan === 'pro') {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-success" />
        </div>
        <h2 className="text-2xl font-black">You're on Pro!</h2>
        <p className="text-text-muted mt-2">All features unlocked. Keep trading and improving.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <div className="text-[11px] text-accent font-bold tracking-[3px] uppercase mb-2">Subscription Plans</div>
        <h1 className="text-3xl font-black tracking-tight">Invest in your edge</h1>
        <p className="text-text-muted mt-2">Paid exclusively via USDT TRC20 · Instant activation</p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free */}
        <div className="bg-bg-card border border-border rounded-2xl p-7">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Free</div>
          <div className="font-mono text-4xl font-black">$0</div>
          <div className="text-text-muted text-sm mt-1">Forever free</div>
          <hr className="border-border my-5" />
          <div className="space-y-3 mb-6">
            {features.free.map(f => (
              <div key={f.text} className="flex items-center gap-3 text-[13px]">
                {f.ok
                  ? <Check size={14} className="text-success flex-shrink-0" />
                  : <X size={14} className="text-text-muted flex-shrink-0" />}
                <span className={f.ok ? 'text-text-secondary' : 'text-text-muted'}>{f.text}</span>
              </div>
            ))}
          </div>
          <button disabled className="w-full py-2.5 text-sm font-bold border border-border rounded-xl text-text-muted cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Pro */}
        <div className="bg-bg-card border-2 border-accent rounded-2xl p-7 relative shadow-glow">
          <div className="absolute top-4 right-4 text-[10px] bg-accent text-black font-black px-2.5 py-1 rounded-full">
            MOST POPULAR
          </div>
          <div className="text-[11px] font-bold text-accent uppercase tracking-widest mb-3">Pro</div>
          <div className="font-mono text-4xl font-black">$10</div>
          <div className="text-success text-sm mt-1 font-semibold">✓ Pay 10 USDT TRC20 · Auto-activate</div>
          <hr className="border-border my-5" />
          <div className="space-y-3 mb-6">
            {features.pro.map(f => (
              <div key={f.text} className="flex items-center gap-3 text-[13px]">
                <Check size={14} className="text-accent flex-shrink-0" />
                <span className="text-text-secondary">{f.text}</span>
              </div>
            ))}
          </div>
          <button
            onClick={startPayment}
            disabled={loading}
            className="w-full py-3 text-sm font-black rounded-xl bg-gradient-to-r from-gold to-[#CC8800] text-black hover:opacity-90 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : '₮'}
            {loading ? 'Generating address...' : 'Pay 10 USDT — Go Pro'}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentData && (
        <div className="fixed inset-0 bg-bg-deep/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border-bright rounded-2xl w-full max-w-md relative">
            <button
              onClick={() => { setPaymentData(null); clearInterval(pollRef.current); clearInterval(timerRef.current); }}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <X size={16} />
            </button>

            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-black">Complete Payment</h3>
              <p className="text-text-secondary text-sm mt-1">Send USDT to activate Pro instantly</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Amount */}
              <div className="flex items-center gap-3 bg-success/10 border border-success/25 rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-[#26A17B] flex items-center justify-center font-black text-white text-sm">₮</div>
                <div>
                  <div className="text-[11px] text-text-muted">Amount due (TRC20 Network)</div>
                  <div className="font-mono text-2xl font-black text-success">{paymentData.amount} USDT</div>
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="text-[11px] text-text-muted font-semibold uppercase tracking-wide mb-2">
                  Your unique payment address
                </div>
                <div className="bg-bg-deep border border-border rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1 font-mono text-[11px] text-accent break-all">
                    {paymentData.walletAddress}
                  </div>
                  <button onClick={copy} className="flex-shrink-0 bg-bg-elevated border border-border rounded-lg p-2 hover:border-border-bright transition-all">
                    {copied ? <CheckCircle size={14} className="text-success" /> : <Copy size={14} className="text-text-secondary" />}
                  </button>
                </div>
              </div>

              {/* QR */}
              {paymentData.qrCode && (
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl">
                    <img src={paymentData.qrCode} alt="Payment QR" className="w-28 h-28" />
                  </div>
                </div>
              )}

              {/* Timer */}
              <div className="flex items-center justify-between bg-bg-elevated border border-border rounded-xl p-3">
                <div className="flex items-center gap-2 text-[12px] text-text-muted">
                  <Clock size={13} />
                  Address expires in
                </div>
                <div className="font-mono text-gold font-bold">{timer || '29:59'}</div>
              </div>

              {/* Status */}
              {pollStatus && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 flex items-center gap-2">
                  <Loader2 size={13} className="text-accent animate-spin" />
                  <span className="text-[12px] text-accent">{pollStatus}</span>
                </div>
              )}

              {/* Steps */}
              <div className="space-y-2">
                {paymentData.instructions.map((step: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-[12px] text-text-secondary">
                    <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>

              <p className="text-center text-[11px] text-text-muted">
                ⚠️ Send only USDT on TRC20 network. Wrong network = lost funds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
