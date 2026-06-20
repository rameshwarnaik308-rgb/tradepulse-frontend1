'use client';
import { useState, useRef } from 'react';
import { importAPI } from '@/lib/api';
import { Upload, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';

const BROKERS = [
  { id: 'mt4', name: 'MetaTrader 4', desc: 'Export from Account History tab as CSV', ext: '.csv', color: 'text-accent' },
  { id: 'mt5', name: 'MetaTrader 5', desc: 'Export from Deals tab in History', ext: '.csv', color: 'text-purple' },
  { id: 'binance', name: 'Binance', desc: 'Trade History → Export → CSV', ext: '.csv', color: 'text-gold' },
  { id: 'bybit', name: 'Bybit', desc: 'Orders → Closed P&L → Export', ext: '.csv', color: 'text-success' },
  { id: 'hyperliquid', name: 'Hyperliquid', desc: 'Portfolio → Trade History → JSON export', ext: '.json', color: 'text-danger' },
  { id: 'bingx', name: 'BingX', desc: 'Futures → Trade History → CSV', ext: '.csv', color: 'text-accent' },
  { id: 'csv', name: 'Generic CSV', desc: 'Any standard CSV with trade data', ext: '.csv', color: 'text-text-muted' },
];

export default function ImportPage() {
  const [selected, setSelected] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!selected || !file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await importAPI.upload(selected, file);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Import failed. Check file format.');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-black">Import Trades</h1>
        <p className="text-text-muted text-sm mt-0.5">Import your trade history from any major broker</p>
      </div>

      {/* Broker selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {BROKERS.map(b => (
          <button key={b.id} onClick={() => { setSelected(b.id); setFile(null); setResult(null); setError(''); }}
            className={`p-4 rounded-xl border text-left transition-all ${
              selected === b.id
                ? 'border-accent bg-accent/5'
                : 'border-border bg-bg-card hover:border-border-bright'
            }`}>
            <div className={`text-[13px] font-bold ${b.color}`}>{b.name}</div>
            <div className="text-[11px] text-text-muted mt-1">{b.desc}</div>
            <div className="text-[10px] text-text-muted mt-1.5 font-mono">{b.ext}</div>
          </button>
        ))}
      </div>

      {/* File upload */}
      {selected && (
        <div className="bg-bg-card border border-border rounded-xl p-5 mb-4">
          <div className="text-sm font-bold mb-3">
            Upload {BROKERS.find(b => b.id === selected)?.name} file
          </div>
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              file ? 'border-accent/40 bg-accent/5' : 'border-border hover:border-border-bright'
            }`}>
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText size={20} className="text-accent" />
                <div>
                  <div className="text-sm font-semibold text-accent">{file.name}</div>
                  <div className="text-[11px] text-text-muted">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            ) : (
              <>
                <Upload size={24} className="text-text-muted mx-auto mb-2" />
                <div className="text-sm text-text-muted">Click to select file</div>
                <div className="text-[11px] text-text-muted mt-1">
                  {BROKERS.find(b => b.id === selected)?.ext} files only
                </div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".csv,.json" className="hidden"
            onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />

          <button onClick={handleUpload} disabled={!file || loading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-accent to-[#0080CC] text-white text-sm font-bold rounded-xl disabled:opacity-40 hover:opacity-90 transition-all flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Importing...</> : 'Import Trades'}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-5 flex items-start gap-4">
          <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-success">Import successful!</div>
            <div className="text-sm text-text-secondary mt-1">
              <span className="text-success font-mono font-bold">{result.imported}</span> trades imported,{' '}
              <span className="text-text-muted font-mono">{result.skipped}</span> skipped (duplicates).
            </div>
            <div className="text-[11px] text-text-muted mt-1">Check your Trade Journal to see them.</div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-start gap-3">
          <XCircle size={18} className="text-danger flex-shrink-0 mt-0.5" />
          <div className="text-sm text-danger">{error}</div>
        </div>
      )}

      {/* CSV format guide */}
      <div className="mt-6 bg-bg-card border border-border rounded-xl p-5">
        <div className="text-sm font-bold mb-3">Generic CSV Format (minimum columns)</div>
        <div className="font-mono text-[11px] text-text-secondary bg-bg-deep rounded-lg p-3 overflow-x-auto">
          pair,direction,entry_price,exit_price,stop_loss,pnl,entry_time<br/>
          XAU/USD,long,2318.40,2342.00,2308.00,340,2024-06-10 09:14:00<br/>
          BTC/USDT,short,67400,65200,69000,-180,2024-06-09 14:20:00
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Column names are flexible — the importer detects common variations automatically.
        </p>
      </div>
    </div>
  );
}
