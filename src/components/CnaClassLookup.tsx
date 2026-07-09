import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Loader2, FileSpreadsheet, ChevronDown, ChevronRight,
  Building2, MapPin, Package, AlertCircle, Filter, X,
} from 'lucide-react';

// One row from CNA's Business Insurance Profile Guide (Small Business).
export interface CnaClassRow {
  sic: string;
  class_description: string;
  cna_connect_class_code: string;
  industry_group: string;
  small_business_appetite: string;
  products_available: string;
  territorial_restrictions: string;
}

const DATA_URL = '/carrier-assets/cna/profile-guide.json';

// Cache the fetch across drawer open/close so we only load the ~440KB file once.
let cache: CnaClassRow[] | null = null;
let inflight: Promise<CnaClassRow[]> | null = null;

async function loadRows(): Promise<CnaClassRow[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch(DATA_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((rows: CnaClassRow[]) => {
      cache = rows;
      return rows;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export default function CnaClassLookup() {
  const [rows, setRows] = useState<CnaClassRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState<string>('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadRows()
      .then((r) => {
        if (active) setRows(r);
      })
      .catch((e) => {
        if (active) setLoadError(e?.message ?? 'Failed to load CNA profile guide.');
      });
    return () => {
      active = false;
    };
  }, []);

  const industries = useMemo(() => {
    if (!rows) return [];
    return ['All', ...Array.from(new Set(rows.map((r) => r.industry_group))).sort()];
  }, [rows]);

  const results = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (industry !== 'All' && r.industry_group !== industry) return false;
      if (!q) return true;
      return (
        r.class_description.toLowerCase().includes(q) ||
        r.sic.toLowerCase().includes(q) ||
        r.cna_connect_class_code.toLowerCase().includes(q) ||
        r.small_business_appetite.toLowerCase().includes(q)
      );
    });
  }, [rows, query, industry]);

  // Loading
  if (loadError) {
    return (
      <div className="bg-white p-6 rounded-xl border border-red-100 text-sm text-red-600 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Couldn't load the CNA Profile Guide.</p>
          <p className="text-xs text-slate-500 mt-1">{loadError}</p>
        </div>
      </div>
    );
  }
  if (!rows) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-100 flex items-center justify-center gap-3 text-slate-500 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        Loading CNA class codes…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header / context strip */}
      <div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/5 p-4 rounded-2xl border border-blue-200/40 flex items-start gap-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white shrink-0">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-sans font-bold text-slate-900 text-sm">CNA Class Code Lookup</h4>
          <p className="text-[11px] text-slate-500 leading-tight">
            Search {rows.length.toLocaleString()} CNA Small Business class codes — appetite, CNA Central products, and
            territorial restrictions. Sourced from the CNA Business Insurance Profile Guide.
          </p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search class, description, SIC, or class code (e.g. restaurant, 87210, 65121J)"
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="pl-9 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 appearance-none cursor-pointer min-w-[210px]"
          >
            {industries.map((g) => (
              <option key={g} value={g}>
                {g === 'All' ? 'All industry groups' : g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
        <span>
          {results.length.toLocaleString()} {results.length === 1 ? 'class' : 'classes'}
          {industry !== 'All' && ` · ${industry}`}
          {query.trim() && ` · matching "${query.trim()}"`}
        </span>
        {(query || industry !== 'All') && (
          <button
            onClick={() => {
              setQuery('');
              setIndustry('All');
            }}
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Results table */}
      {results.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 italic text-sm">
          No CNA class codes match that search. Try a broader term or clear the filters.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                  <th className="px-3 py-2.5 w-8"></th>
                  <th className="px-3 py-2.5">Class Description</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">SIC</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">CNA Connect</th>
                  <th className="px-3 py-2.5">Industry Group</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 200).map((r) => {
                  const key = `${r.sic}-${r.cna_connect_class_code}`;
                  const isOpen = expanded === key;
                  return (
                    <React.Fragment key={key}>
                      <tr
                        onClick={() => setExpanded(isOpen ? null : key)}
                        className={`border-t border-slate-100 cursor-pointer transition-colors ${
                          isOpen ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="px-3 py-2.5 text-slate-400 align-top">
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-medium text-slate-800 align-top">
                          {r.class_description}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-mono text-slate-500 whitespace-nowrap align-top">
                          {r.sic}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-mono text-blue-700 whitespace-nowrap align-top">
                          {r.cna_connect_class_code}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-600 align-top">
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {r.industry_group}
                          </span>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-blue-50/30">
                          <td></td>
                          <td colSpan={4} className="px-3 pb-4 pt-1 space-y-3">
                            <DetailRow icon={<Search className="w-3.5 h-3.5" />} label="Small Business Appetite" value={r.small_business_appetite} />
                            <DetailRow icon={<Package className="w-3.5 h-3.5" />} label="Products on CNA Central" value={r.products_available} />
                            <DetailRow icon={<MapPin className="w-3.5 h-3.5" />} label="Territorial Restrictions" value={r.territorial_restrictions} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          {results.length > 200 && (
            <div className="px-3 py-2.5 text-[11px] text-slate-500 bg-slate-50 border-t border-slate-100">
              Showing first 200 of {results.length.toLocaleString()} matches — narrow the search to see more.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-mono mb-1">
        {icon}
        {label}
      </div>
      <p className="text-xs text-slate-700 leading-relaxed">{value || '—'}</p>
    </div>
  );
}
