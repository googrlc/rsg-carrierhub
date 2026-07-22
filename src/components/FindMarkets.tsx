import React, { useState } from 'react';
import { Loader2, Target, Check, AlertTriangle, ArrowRight, Building2, Percent } from 'lucide-react';

// Structured market finder over the deterministic /api/appetite-match endpoint.
// Unlike the AI advisor (freeform prose), this ranks the carrier_appetite spine
// on exact risk attributes and shows why each program fit + what to verify.
interface MatchResult {
  carrierId: string | null;
  carrier: string;
  program: string;
  generalAgent: string | null;
  appetiteLevel: string | null;
  minPremium: number | null;
  maxPremium: number | null;
  score: number;
  reasons: string[];
  cautions: string[];
}

export default function FindMarkets() {
  const [lob, setLob] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [classCode, setClassCode] = useState('');
  const [premium, setPremium] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MatchResult[] | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearching) return;
    if (![lob, stateVal, classCode, premium, keywords].some((v) => v.trim())) {
      setError('Enter at least one field — LOB, state, class code, premium, or keywords.');
      return;
    }
    setIsSearching(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/appetite-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lob: lob.trim() || undefined,
          state: stateVal.trim() || undefined,
          classCode: classCode.trim() || undefined,
          premium: premium.trim() ? Number(premium) : undefined,
          keywords: keywords.trim() || undefined,
          limit: 15,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as { error?: string }));
        throw new Error(j.error || `Server returned ${res.status}`);
      }
      const data = await res.json();
      setResults(Array.isArray(data.matches) ? data.matches : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const levelColor = (lvl: string | null) =>
    lvl === 'preferred' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : lvl === 'standard' ? 'bg-blue-50 text-blue-700 border-blue-200'
    : lvl === 'non-standard' ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-slate-100 text-slate-500 border-slate-200';

  const field = (label: string, node: React.ReactNode) => (
    <div>
      <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">{label}</label>
      {node}
    </div>
  );
  const inputCls = 'w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-600 transition';

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 py-2">
        <div className="mx-auto w-10.5 h-10.5 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
          <Target className="w-5.5 h-5.5" />
        </div>
        <h2 className="text-2xl font-sans font-semibold text-slate-900 tracking-tight">Find Markets</h2>
        <p className="text-xs text-slate-400">
          Enter a risk and get ranked carrier + program fits from the live appetite spine — deterministic, with the reasons each fit and what to verify.
        </p>
      </div>

      {/* Structured query form */}
      <form onSubmit={run} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {field('Line of Business', <input type="text" placeholder="e.g. General Liability" value={lob} onChange={(e) => setLob(e.target.value)} className={inputCls} />)}
          {field('State', <input type="text" placeholder="GA or Georgia" value={stateVal} onChange={(e) => setStateVal(e.target.value)} className={inputCls} />)}
          {field('Class / SIC Code', <input type="text" placeholder="e.g. 87210" value={classCode} onChange={(e) => setClassCode(e.target.value)} className={inputCls} />)}
          {field('Est. Premium ($)', <input type="number" placeholder="e.g. 3500" value={premium} onChange={(e) => setPremium(e.target.value)} className={inputCls} />)}
          <div className="sm:col-span-2">
            {field('Keywords (risk description)', <input type="text" placeholder="e.g. roofing contractor, restaurant with liquor" value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputCls} />)}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:shadow-lg disabled:opacity-50 transition flex items-center gap-1.5"
          >
            {isSearching ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" />Ranking markets…</>) : (<>Find Markets<ArrowRight className="w-3.5 h-3.5" /></>)}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">{error}</div>
      )}

      {/* Results */}
      {results && (
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-sans font-bold text-sm text-slate-900">
              {results.length} market{results.length === 1 ? '' : 's'} ranked
            </h3>
            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded font-mono font-bold uppercase tracking-wide">Deterministic</span>
          </div>

          {results.length === 0 && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
              No appetite rows matched. Try broader keywords or fewer filters.
            </div>
          )}

          {results.map((m, i) => (
            <div key={`${m.carrierId ?? m.carrier}-${m.program}-${i}`} className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-sans font-bold text-slate-800 text-sm">{m.carrier}</span>
                  <span className="text-[11px] text-slate-500">· {m.program}</span>
                  {m.appetiteLevel && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${levelColor(m.appetiteLevel)}`}>{m.appetiteLevel}</span>
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 rounded px-2 py-0.5 shrink-0" title="Match score">score {m.score}</span>
              </div>

              <div className="mt-2 space-y-1">
                {m.reasons.map((r, j) => (
                  <div key={j} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0 stroke-[3px]" />
                    <span>{r}</span>
                  </div>
                ))}
                {m.cautions.map((c, j) => (
                  <div key={j} className="flex items-start gap-1.5 text-[11px] text-amber-700">
                    <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>

              {(m.generalAgent || m.minPremium != null || m.maxPremium != null) && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-3 text-[10px] text-slate-400 font-mono">
                  {m.generalAgent && <span>GA: {m.generalAgent}</span>}
                  {(m.minPremium != null || m.maxPremium != null) && (
                    <span className="flex items-center gap-1"><Percent className="w-3 h-3" />${m.minPremium ?? '?'}–${m.maxPremium ?? '?'}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!results && !isSearching && !error && (
        <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center py-8 space-y-2">
          <Target className="w-6 h-6 text-slate-300" />
          <p className="text-[11px] text-slate-400 leading-normal max-w-sm">
            Fill in what you know about the risk. The finder ranks every active carrier program and flags premium-band, state, and exclusion cautions.
          </p>
        </div>
      )}
    </div>
  );
}
