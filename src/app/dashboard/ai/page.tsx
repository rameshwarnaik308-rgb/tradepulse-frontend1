'use client';
import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Bot, Send, Loader2, TrendingUp, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import Link from 'next/link';

interface Msg { role: 'user' | 'assistant'; content: string; }

const STARTERS = [
  'Why do I keep revenge trading?',
  'Analyze my win rate this month',
  'How can I improve my R:R?',
  'What are my best and worst sessions?',
  'Grade my trading psychology',
];

export default function AICoachPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content: `Hey ${user?.name?.split(' ')[0]}! I'm APEX, your AI trading coach. I've analyzed your trade history and I'm ready to help you level up. What would you like to work on today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'weekly' | 'monthly'>('chat');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (user?.plan !== 'pro') {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-accent" />
          </div>
          <h2 className="text-xl font-black mb-2">AI Coach is Pro only</h2>
          <p className="text-text-muted text-sm mb-5">
            Get personalized AI coaching, weekly reports, and behaviour pattern detection.
          </p>
          <Link href="/dashboard/pricing"
            className="inline-block px-6 py-3 bg-gradient-to-r from-gold to-[#CC8800] text-black font-black rounded-xl">
            Upgrade — 10 USDT
          </Link>
        </div>
      </div>
    );
  }

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const newMessages: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await aiAPI.chat(text, history);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection issue — try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (type: 'weekly' | 'monthly') => {
    setActiveTab(type);
    if (report?.type === type) return;
    setReportLoading(true);
    try {
      const res = await aiAPI.report(type);
      setReport({ ...res.data.report, type });
    } catch {
      setReport({ error: true, type });
    } finally {
      setReportLoading(false);
    }
  };

  const gradeColor = (g: string) => {
    if (!g) return 'text-text-muted';
    if (g.startsWith('A')) return 'text-success';
    if (g.startsWith('B')) return 'text-accent';
    if (g.startsWith('C')) return 'text-gold';
    return 'text-danger';
  };

  return (
    <div className="p-6 h-full flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Bot size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-lg font-black">APEX AI Coach</h1>
          <div className="flex items-center gap-1.5 text-[11px] text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Online · Analyzing your trades
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {(['chat', 'weekly', 'monthly'] as const).map(tab => (
            <button key={tab} onClick={() => tab === 'chat' ? setActiveTab('chat') : loadReport(tab)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-accent/15 text-accent border border-accent/25'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
              }`}>
              {tab === 'chat' ? '💬 Chat' : tab === 'weekly' ? '📊 Weekly' : '📅 Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex-1 bg-bg-card border border-border rounded-xl flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Bot size={13} className="text-accent" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-3 rounded-xl text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent/10 border border-accent/20 text-text-primary'
                    : 'bg-bg-elevated border border-border text-text-primary'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot size={13} className="text-accent" />
                </div>
                <div className="bg-bg-elevated border border-border rounded-xl px-4 py-3">
                  <Loader2 size={14} className="text-accent animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Starters */}
          {messages.length === 1 && (
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {STARTERS.map(s => (
                <button key={s} onClick={() => { setInput(s); }}
                  className="text-[11px] px-3 py-1.5 bg-bg-elevated border border-border rounded-full text-text-secondary hover:text-accent hover:border-accent/30 transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask your coach anything..."
              className="flex-1 bg-bg-deep border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-all"
            />
            <button onClick={send} disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-accent text-black flex items-center justify-center hover:bg-accent/90 disabled:opacity-40 transition-all">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Report Tab */}
      {(activeTab === 'weekly' || activeTab === 'monthly') && (
        <div className="flex-1 bg-bg-card border border-border rounded-xl overflow-y-auto">
          {reportLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={20} className="text-accent animate-spin" />
              <span className="ml-3 text-text-muted text-sm">Generating {activeTab} report...</span>
            </div>
          ) : report?.error ? (
            <div className="flex items-center justify-center h-48 text-danger text-sm">
              Failed to generate report. Add more trades first.
            </div>
          ) : report ? (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-black font-mono ${gradeColor(report.overall_grade)}`}>
                  {report.overall_grade || 'B'}
                </div>
                <div>
                  <div className="text-sm font-bold capitalize">{activeTab} Performance Grade</div>
                  <div className="text-text-muted text-[12px] mt-0.5">
                    {new Date(report.period_start).toLocaleDateString()} — {new Date(report.period_end).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="bg-bg-elevated border border-border rounded-xl p-5">
                <pre className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">
                  {report.content}
                </pre>
              </div>
              {report.metrics && (
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(report.metrics).map(([k, v]: any) => (
                    <div key={k} className="bg-bg-elevated border border-border rounded-lg p-3">
                      <div className="text-[10px] text-text-muted capitalize">{k.replace(/_/g, ' ')}</div>
                      <div className="font-mono text-sm font-bold mt-1">{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
