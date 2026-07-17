import React, { useMemo, useState } from 'react';
import { Key, ExternalLink, ArrowRight } from 'lucide-react';
import { LAUNCHPAD_LINKS, type LaunchpadTab } from '../data/launchpad';

export interface CarrierPortalShortcut {
  id: string;
  name: string;
  agencyCode?: string;
  agentLogin: string;
}

interface LaunchpadProps {
  /** Jump to another CarrierHub tab (internal tiles). */
  onNavigate: (tab: LaunchpadTab) => void;
  /** Favorited carriers that have a producer-portal login, shown under Carriers. */
  carrierPortals?: CarrierPortalShortcut[];
}

export default function Launchpad({ onNavigate, carrierPortals = [] }: LaunchpadProps) {
  const [query, setQuery] = useState('');

  // Group links by section, preserving first-seen order.
  const sections = useMemo(() => {
    const order: string[] = [];
    const bySection = new Map<string, typeof LAUNCHPAD_LINKS>();
    for (const link of LAUNCHPAD_LINKS) {
      if (!bySection.has(link.section)) {
        bySection.set(link.section, []);
        order.push(link.section);
      }
      bySection.get(link.section)!.push(link);
    }
    return order.map((name) => ({ name, links: bySection.get(name)! }));
  }, []);

  const q = query.trim().toLowerCase();
  const matches = (text: string) => !q || text.toLowerCase().includes(q);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter tools…"
        autoComplete="off"
        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />

      {sections.map((section) => {
        const links = section.links.filter((l) => matches(`${l.name} ${l.desc} ${section.name}`));
        const portals =
          section.name === 'Carriers'
            ? carrierPortals.filter((p) => matches(`${p.name} ${p.agencyCode ?? ''} carrier portal`))
            : [];
        if (links.length === 0 && portals.length === 0) return null;

        return (
          <section key={section.name} className="space-y-3">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-blue-600 border-b border-slate-200 pb-2">
              {section.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {links.map((link) => {
                const Icon = link.icon;
                const internal = !!link.tab;
                const Tile = internal ? 'button' : 'a';
                const tileProps = internal
                  ? { onClick: () => onNavigate(link.tab!), type: 'button' as const }
                  : { href: link.url, target: '_blank', rel: 'noopener noreferrer' };
                return (
                  <Tile
                    key={link.name}
                    {...(tileProps as any)}
                    className="group text-left flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-blue-600/10 to-indigo-600/5 text-blue-700 border border-slate-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 stroke-[1.75px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-800 truncate">{link.name}</span>
                        {internal ? (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        ) : (
                          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-snug mt-0.5">{link.desc}</p>
                    </div>
                  </Tile>
                );
              })}

              {/* Favorited carrier producer portals, appended under Carriers. */}
              {portals.map((p) => (
                <a
                  key={p.id}
                  href={p.agentLogin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-left flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 font-mono text-xs font-bold flex items-center justify-center">
                    {p.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-800 truncate">{p.name}</span>
                      <Key className="w-3 h-3 text-amber-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <p className="text-xs text-slate-500 leading-snug mt-0.5">
                      Producer portal login{p.agencyCode ? ` · ${p.agencyCode}` : ''}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
