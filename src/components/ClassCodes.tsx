import React, { useState } from 'react';
import {
  Loader2, BookOpen, Search, Plus, AlertTriangle, Building2, ArrowRight,
  X, Check, Ban, HelpCircle,
} from 'lucide-react';

// Class-code lookup over the manual tables (gl_class_codes / wc_class_codes) and the
// carrier↔code bridge. Two directions of the same question — "what does this code
// cover?" and "what code is this operation?" — plus the form that fills in the search
// layer, which is empty on most manual rows and is what makes reverse lookup work.
interface CodeHit {
  id: string;
  system: 'gl' | 'wc';
  code: string;
  description: string;
  category: string | null;
  subcategory: string | null;
  searchKeywords: string | null;
  typicalOf: string | null;
  notes: string | null;
  residentialOnly: boolean | null;
  maxStories: number | null;
  state: string | null;
  score: number;
  why: string[];
}

interface Market {
  carrier: string;
  carrierId: string;
  lob: string;
  appetiteLevel: string | null;
  eligibility: 'eligible' | 'conditional' | 'prohibited';
  matchMethod: string;
  confidence: string;
  stateScope: string | null;
  restrictions: string | null;
  sourceNote: string | null;
  statesApproved: string[];
}

interface Detail {
  code: CodeHit;
  siblings: { code: string; description: string; notes: string | null }[];
  markets: Market[];
  unbridged: { carrier: string; lob: string; appetiteLevel: string | null }[];
}

export default function ClassCodes() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<CodeHit[] | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const search = async (term: string) => {
    if (!term.trim() || isSearching) return;
    setIsSearching(true);
    setError(null);
    setDetail(null);
    try {
      const res = await fetch(`/api/class-codes?q=${encodeURIComponent(term.trim())}&limit=25`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as { error?: string }));
        throw new Error(j.error || `Server returned ${res.status}`);
      }
      const data = await res.json();
      setHits(Array.isArray(data.codes) ? data.codes : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    void search(query);
  };

  const openDetail = async (hit: CodeHit) => {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/class-codes/${encodeURIComponent(hit.code)}?system=${hit.system}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as { error?: string }));
        throw new Error(j.error || `Server returned ${res.status}`);
      }
      setDetail(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const inputCls =
    'w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-600 transition';

  const systemChip = (s: 'gl' | 'wc') =>
    s === 'gl'
      ? 'text-indigo-700 bg-indigo-50 border-indigo-100'
      : 'text-teal-700 bg-teal-50 border-teal-100';

  const eligibilityStyle = (e: Market['eligibility']) =>
    e === 'eligible' ? { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: Check }
    : e === 'conditional' ? { cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: AlertTriangle }
    : { cls: 'bg-red-50 text-red-700 border-red-200', Icon: Ban };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 py-2 relative">
        <div className="mx-auto w-10.5 h-10.5 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
          <BookOpen className="w-5.5 h-5.5" />
        </div>
        <h2 className="text-2xl font-sans font-semibold text-slate-900 tracking-tight">Class Codes</h2>
        <p className="text-xs text-slate-400">
          Search by code (<span className="font-mono">91341</span>) or describe the operation
          (<span className="italic">"cabinets and countertops"</span>). Covers 1,154 GL and 499 WC
          manual codes — each one shows the neighbouring codes it's confused with and who on the
          panel writes it.
        </p>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="absolute top-0 right-0 text-[10px] px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-700 transition flex items-center gap-1"
        >
          {showAdd ? <><X className="w-3 h-3" /> Close</> : <><Plus className="w-3 h-3" /> Add detail</>}
        </button>
      </div>

      {showAdd && <AddCodeDetail onSaved={(c) => { setShowAdd(false); void search(query.trim() || c); }} />}

      {/* Search */}
      <form onSubmit={run} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="91341, or: finish carpentry — doors, trim, cabinets"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputCls} pl-9`}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold hover:shadow-lg disabled:opacity-50 transition flex items-center gap-1.5 shrink-0"
        >
          {isSearching ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Searching…</> : <>Look up<ArrowRight className="w-3.5 h-3.5" /></>}
        </button>
      </form>

      {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">{error}</div>}

      {/* Results */}
      {hits && !detail && !detailLoading && (
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <h3 className="font-sans font-bold text-sm text-slate-900">
            {hits.length} candidate{hits.length === 1 ? '' : 's'}
          </h3>

          {hits.length === 0 && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
              No manual code matched those words. Try the code number directly, or fewer terms —
              most codes have no keywords recorded yet, so descriptions are all there is to match on.
            </div>
          )}

          {hits.map((h) => (
            <button
              key={`${h.system}-${h.id}`}
              onClick={() => openDetail(h)}
              className="w-full text-left bg-white p-4 rounded-xl border border-slate-150 shadow-xs hover:border-indigo-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono font-bold text-xs border rounded px-1.5 py-0.5 ${systemChip(h.system)}`}>
                    {h.system.toUpperCase()} {h.code}
                  </span>
                  <span className="font-sans font-bold text-slate-800 text-sm">{h.description}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 rounded px-2 py-0.5 shrink-0">
                  score {h.score}
                </span>
              </div>

              {h.notes && <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{h.notes}</p>}

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono">
                {(h.category || h.subcategory) && <span>{[h.category, h.subcategory].filter(Boolean).join(' / ')}</span>}
                {h.maxStories && <span>MAX STORIES: {h.maxStories}</span>}
                {h.state && <span>STATE: {h.state}</span>}
              </div>

              {h.why.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-500 mt-1">
                  {w.startsWith('Manual description only')
                    ? <HelpCircle className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                    : <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0 stroke-[3px]" />}
                  <span>{w}</span>
                </div>
              ))}
            </button>
          ))}
        </div>
      )}

      {detailLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading code…
        </div>
      )}

      {/* Detail */}
      {detail && (
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <button onClick={() => setDetail(null)} className="text-[11px] text-slate-500 hover:text-slate-800 transition">
            ← Back to results
          </button>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-mono font-bold text-xs border rounded px-1.5 py-0.5 bg-white ${systemChip(detail.code.system)}`}>
                {detail.code.system.toUpperCase()} {detail.code.code}
              </span>
              <h3 className="font-sans font-bold text-slate-900 text-base">{detail.code.description}</h3>
            </div>
            {detail.code.notes && <p className="text-xs text-slate-600 leading-relaxed">{detail.code.notes}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
              {detail.code.typicalOf && (
                <div className="sm:col-span-2"><span className="text-slate-400 font-mono">TYPICAL </span>{detail.code.typicalOf}</div>
              )}
              {(detail.code.category || detail.code.subcategory) && (
                <div><span className="text-slate-400 font-mono">CATEGORY </span>{[detail.code.category, detail.code.subcategory].filter(Boolean).join(' / ')}</div>
              )}
              {detail.code.maxStories && (
                <div><span className="text-slate-400 font-mono">MAX STORIES </span>{detail.code.maxStories}</div>
              )}
              {detail.code.searchKeywords && (
                <div className="sm:col-span-2"><span className="text-slate-400 font-mono">KEYWORDS </span><span className="text-slate-500">{detail.code.searchKeywords}</span></div>
              )}
            </div>
          </div>

          {/* Neighbouring codes in the same manual family */}
          {detail.siblings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wide">
                Same family — check you're on the right one
              </h4>
              {detail.siblings.map((s, i) => (
                <div key={i} className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-mono font-bold text-slate-800">{s.code}</span>
                    <span className="text-slate-700"> — {s.description}</span>
                    {s.notes && <p className="text-slate-600 mt-0.5">{s.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Who writes it */}
          <div className="space-y-2">
            <h4 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wide">
              Who can write it ({detail.markets.length})
            </h4>
            {detail.markets.length === 0 ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center text-[11px] text-slate-400 italic">
                No carrier is linked to this code yet. That's a gap in the record, not necessarily a
                gap in appetite — confirm with the carrier, then link it.
              </div>
            ) : (
              detail.markets.map((m, i) => {
                const { cls, Icon } = eligibilityStyle(m.eligibility);
                return (
                  <div key={i} className="bg-white p-3 rounded-xl border border-slate-150 shadow-xs space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-sans font-bold text-slate-800 text-xs">{m.carrier}</span>
                        <span className="text-[11px] text-slate-500">· {m.lob}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase flex items-center gap-1 ${cls}`}>
                          <Icon className="w-3 h-3" />{m.eligibility}
                        </span>
                        {m.stateScope && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">{m.stateScope} only</span>
                        )}
                      </div>
                      {/* Provenance is load-bearing: a derived link must never read as carrier-verified. */}
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 border ${
                          m.matchMethod === 'explicit_source'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                        title={m.matchMethod === 'explicit_source'
                          ? "The carrier's own source states this code"
                          : 'Derived — confirm with the carrier before relying on it'}
                      >
                        {m.matchMethod}
                      </span>
                    </div>
                    {m.restrictions && <p className="text-[11px] text-amber-700 pl-6">{m.restrictions}</p>}
                    {m.statesApproved.length > 0 && (
                      <p className="text-[10px] text-slate-400 font-mono pl-6">{m.statesApproved.join(', ')}</p>
                    )}
                  </div>
                );
              })
            )}

            {detail.unbridged.length > 0 && (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[11px] text-slate-500">
                <span className="font-semibold">Also listed on older appetite rows</span> (not yet linked
                through the bridge, so eligibility and restrictions are unknown):{' '}
                {detail.unbridged.map((u) => `${u.carrier} (${u.lob})`).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {!hits && !isSearching && !error && (
        <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center py-8 space-y-2">
          <BookOpen className="w-6 h-6 text-slate-300" />
          <p className="text-[11px] text-slate-400 leading-normal max-w-sm">
            The manual descriptions are already loaded. What's mostly missing is the search layer —
            keywords and typical businesses — which is what makes describing an operation find the
            right code. "Add detail" fills that in as you learn it.
          </p>
        </div>
      )}
    </div>
  );
}

// Fills in the search/context layer on a manual code. The code and its official
// description come from the manual; everything here is what makes it findable and
// what stops the next person re-deriving the same distinction.
function AddCodeDetail({ onSaved }: { onSaved: (code: string) => void }) {
  const [system, setSystem] = useState<'gl' | 'wc'>('gl');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [typical, setTypical] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const save = async () => {
    if (!code.trim()) { setErr('A code is required.'); return; }
    setSaving(true); setErr(null); setOk(false);
    try {
      const body: Record<string, unknown> = { system, code: code.trim() };
      if (description.trim()) body.description = description.trim();
      if (keywords.trim()) body.search_keywords = keywords.trim();
      if (notes.trim()) body.notes = notes.trim();
      if (category.trim()) body.category = category.trim();
      if (typical.trim()) {
        body[system === 'gl' ? 'typical_businesses' : 'typical_duties'] = typical.trim();
      }

      const res = await fetch('/api/class-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as { error?: string }));
        throw new Error(j.error || `Server returned ${res.status}`);
      }
      const saved = code.trim();
      setOk(true);
      setCode(''); setDescription(''); setKeywords(''); setTypical(''); setNotes(''); setCategory('');
      onSaved(saved);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/25 focus:border-indigo-600 transition';
  const field = (label: string, node: React.ReactNode, span = false) => (
    <div className={span ? 'sm:col-span-3' : ''}>
      <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">{label}</label>
      {node}
    </div>
  );

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-800 text-xs">Add detail to a class code</span>
        <span className="text-[10px] text-slate-400">Blank fields keep their current value.</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {field('Manual', (
          <select value={system} onChange={(e) => setSystem(e.target.value as 'gl' | 'wc')} className={inputCls}>
            <option value="gl">GL (ISO)</option>
            <option value="wc">WC (NCCI)</option>
          </select>
        ))}
        {field('Code *', <input type="text" placeholder="91341" value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} />)}
        {field('Category', <input type="text" placeholder="Contractors" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} />)}
        {field('Description (only needed if the code is missing)', <input type="text" placeholder="Carpentry--Interior" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />, true)}
        {field('Search keywords — what makes it findable by description', <input type="text" placeholder="carpentry interior finish trim cabinets countertops" value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputCls} />, true)}
        {field(system === 'gl' ? 'Typical businesses' : 'Typical duties', <input type="text" placeholder="Finish carpenter, cabinet installer" value={typical} onChange={(e) => setTypical(e.target.value)} className={inputCls} />, true)}
        {field('Notes — scope, and what belongs on a different code', <textarea placeholder="Finish work requiring higher skill than rough framing. Structural rough framing belongs on 91340. Source: LM underwriter, 7/2026." value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} min-h-[54px]`} />, true)}
      </div>

      {err && <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-[11px] text-red-700">{err}</div>}
      {ok && <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] text-emerald-700">Saved — searchable here, in Ask Carrier Desk, and from Hermes.</div>}

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving || !code.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition flex items-center gap-1.5"
        >
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</> : <><Plus className="w-3.5 h-3.5" />Save detail</>}
        </button>
      </div>
    </div>
  );
}
