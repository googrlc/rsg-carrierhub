import React, { useState } from 'react';
import { Search, Loader2, Sparkles, Building, AlertCircle, HelpCircle, ArrowRight, Compass } from 'lucide-react';
import { Carrier } from '../types';

interface GlobalFinderProps {
  carriers: Carrier[];
}

export default function GlobalFinder({ carriers }: GlobalFinderProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [sources, setSources] = useState<{carrier:string;sic:string;classCode:string;classDescription:string}[] | null>(null);

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setResultText(null);
    setSources(null);

    try {
      const response = await fetch('/api/global-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiry: query.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      setResultText(data.text);
      setSources(Array.isArray(data.sources) ? data.sources : null);
    } catch (err: any) {
      setResultText(`❌ **Failed to consult underwriting index**: ${err.message}. Please verify the carrier server connector is running and your API Key is specified correctly.`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSampleSelect = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  // Safe and clean custom Markdown formatter to styled TSX renderer
  const renderFormattedResult = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return (
      <div className="space-y-3 font-serif leading-relaxed text-sm text-slate-800">
        {lines.map((line, index) => {
          const trimmed = line.trim();

          // Heading 1 or 2
          if (trimmed.startsWith('###')) {
            return (
              <h4 key={index} className="text-sm font-sans font-bold text-blue-900 mt-5 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-blue-500 rounded-sm" />
                {trimmed.replace(/^###\s*/, '')}
              </h4>
            );
          }

          if (trimmed.startsWith('##') || trimmed.startsWith('#')) {
            return (
              <h3 key={index} className="text-base font-sans font-black text-slate-900 border-b border-slate-100 pb-1.5 mt-6 mb-2.5 flex items-center gap-2">
                {trimmed.replace(/^##?\s*/, '')}
              </h3>
            );
          }

          // Bullet points
          if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const rawContent = trimmed.replace(/^[-*]\s*/, '');
            // Highlight bold elements inside bullet
            return (
              <div key={index} className="flex items-start gap-2.5 pl-3 text-xs leading-normal font-sans text-slate-600 my-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <span className="flex-1">{parseInlineBold(rawContent)}</span>
              </div>
            );
          }

          // Number lists
          if (/^\d+\.\s/.test(trimmed)) {
            const rawContent = trimmed.replace(/^\d+\.\s*/, '');
            const number = trimmed.match(/^\d+/)?.toString() || '1';
            return (
              <div key={index} className="flex items-start gap-2.5 pl-1 text-xs leading-normal font-sans text-slate-700 my-1.5">
                <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 border border-blue-100/50 w-5 h-5 rounded flex items-center justify-center shrink-0">
                  {number}
                </span>
                <span className="flex-1 pt-0.5">{parseInlineBold(rawContent)}</span>
              </div>
            );
          }

          // Special callout indicators
          if (trimmed.includes('[✅ WITHIN APPETITE]')) {
            return (
              <div key={index} className="p-3.5 my-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl text-emerald-800 text-xs font-sans flex items-center gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <span className="font-bold block tracking-tight uppercase text-[10px] text-emerald-600">Decision Outcome</span>
                  <p className="font-semibold leading-snug">{trimmed.replace(/\[?✅ WITHIN APPETITE\]?/g, '').trim()}</p>
                </div>
              </div>
            );
          }

          if (trimmed.includes('[⚠️ REFER TO UNDERWRITING]')) {
            return (
              <div key={index} className="p-3.5 my-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-amber-800 text-xs font-sans flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <span className="font-bold block tracking-tight uppercase text-[10px] text-amber-600">Decision Outcome</span>
                  <p className="font-semibold leading-snug">{trimmed.replace(/\[?⚠️ REFER TO UNDERWRITING\]?/g, '').trim()}</p>
                </div>
              </div>
            );
          }

          if (trimmed.includes('[❌ PROHIBITED')) {
            return (
              <div key={index} className="p-3.5 my-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-800 text-xs font-sans flex items-center gap-3">
                <span className="text-xl">❌</span>
                <div>
                  <span className="font-bold block tracking-tight uppercase text-[10px] text-red-600">Decision Outcome</span>
                  <p className="font-semibold leading-snug">{trimmed.replace(/\[?❌ PROHIBITED \/ EXPELLED\]?/g, '').trim()}</p>
                </div>
              </div>
            );
          }

          // Standard paragraph lines
          return trimmed ? (
            <p key={index} className="text-xs text-slate-600 leading-relaxed font-sans">{parseInlineBold(trimmed)}</p>
          ) : (
            <div key={index} className="h-2" />
          );
        })}
      </div>
    );
  };

  // Helper function to extract and design **bold** text inline
  const parseInlineBold = (content: string) => {
    // Regex matching anything surrounded by double asterisks
    const parts = content.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      // Every odd element was matched group inside **
      if (index % 2 === 1) {
        return (
          <strong key={index} className="font-semibold text-slate-950 bg-blue-50/60 px-1 py-0.5 rounded text-[11px]">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs max-w-4xl mx-auto space-y-6">
      
      {/* Search Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
        <div className="mx-auto w-10.5 h-10.5 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
          <Sparkles className="w-5.5 h-5.5 animate-pulse" />
        </div>
        <h2 className="text-2xl font-sans font-semibold text-slate-900 tracking-tight">Cross-Carrier Underwriting Index</h2>
        <p className="text-xs text-slate-400">
          Double-check client risks across all active lines of business, carriers, and E&S packages in your entire agency deck in one single step.
        </p>
      </div>

      {/* Main Form query box */}
      <form onSubmit={handleGlobalSearch} className="space-y-3">
        <div className="relative">
          <textarea
            placeholder="Type your risk description... (e.g. 'I have a tenant looking for Airbnb coverage on a single family duplex held under an LLC', or 'Who writes Workers Comp for a local roofing crew with 4 employees in Texas?')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
            className="w-full text-xs p-4 pl-11 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-600 placeholder:text-slate-400 min-h-[95px] transition-all"
            required
          />
          <Search className="absolute left-4 top-4.5 w-5 h-5 text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Quick Examples */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400">Try these:</span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => handleSampleSelect("Who is my best carrier option for commercial multi-family condo property with roof ages dating back to 2011?")}
                className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-700 transition"
              >
                "Old Roof Commercial HOA"
              </button>
              <button
                type="button"
                onClick={() => handleSampleSelect("Which providers write main-street retail BOP packages with instant approval APIs?")}
                className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-700 transition"
              >
                "Quick BOP options"
              </button>
              <button
                type="button"
                onClick={() => handleSampleSelect("Do I have any carrier that writes Workers Compensation for heavy labor or artisan plumbers in Texas?")}
                className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-700 transition"
              >
                "Texas plumbing artisan"
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold hover:shadow-lg disabled:opacity-50 transition flex items-center gap-1.5"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Asking the Hub...
              </>
            ) : (
              <>
                Ask the Hub
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results output section */}
      {resultText || isSearching ? (
        <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-sans font-bold text-sm text-slate-900">Hub Answer</h3>
            <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded font-mono font-bold uppercase tracking-wide">AI Checked</span>
          </div>

          {isSearching ? (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-3 min-h-[220px]">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700">Checking submission guidelines across carrier panel...</p>
                <p className="text-[10px] text-slate-400">Grounded in the live carrier directory, contacts, and CNA class codes...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50 min-h-[180px] shadow-xs">
                {renderFormattedResult(resultText || '')}
              </div>
              {sources && sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Class codes used:</span>
                  {sources.map((src, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono" title={src.classDescription}>
                      {src.carrier} · {src.classCode} · {src.classDescription.slice(0, 36)}{src.classDescription.length > 36 ? '…' : ''}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center py-10 space-y-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-xs">
            <Compass className="w-5 h-5 stroke-[1.5px]" />
          </div>
          <div className="space-y-1 max-w-sm">
            <span className="block font-semibold text-slate-700 text-xs text-center">Standby for appetite scan</span>
            <p className="text-[11px] text-slate-400 leading-normal text-center">
              Describe your commercial case or personal lines risk detail above. The AI advisor loops through active guidelines to highlight perfect carrier placement.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
