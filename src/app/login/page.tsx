'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [twoFa, setTwoFa] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password, needs2FA ? twoFa : undefined);
      if (res?.requires2FA) { setNeeds2FA(true); setLoading(false); return; }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="gradient-text text-3xl font-black mb-2">TradePulse</div>
          <div className="text-text-muted text-sm">Sign in to your trading journal</div>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!needs2FA ? (
              <>
                <div>
                  <label className="text-[11px] text-text-muted font-semibold uppercase tracking-wide block mb-1.5">Email</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-bg-deep border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-all"
                    placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="text-[11px] text-text-muted font-semibold uppercase tracking-wide block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full bg-bg-deep border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-all pr-11"
                      placeholder="••••••••" required />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="text-[11px] text-text-muted font-semibold uppercase tracking-wide block mb-1.5">2FA Code</label>
                <input
                  type="text" value={twoFa} onChange={e => setTwoFa(e.target.value)}
                  className="w-full bg-bg-deep border border-border rounded-xl px-4 py-3 text-sm font-mono text-center tracking-widest text-text-primary focus:border-accent focus:outline-none"
                  placeholder="000000" maxLength={6} autoFocus />
              </div>
            )}

            {error && <div className="text-danger text-[12px] bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-accent to-[#0080CC] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {needs2FA ? 'Verify & Sign In' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative text-center"><span className="bg-bg-card px-3 text-[11px] text-text-muted">or</span></div>
          </div>

          <button className="w-full py-3 border border-border rounded-xl text-sm text-text-secondary hover:border-border-bright hover:text-text-primary transition-all flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p className="text-center text-[12px] text-text-muted mt-5">
            No account?{' '}
            <Link href="/register" className="text-accent hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
