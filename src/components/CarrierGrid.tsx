import React, { useState } from 'react';
import { 
  Search, ShieldCheck, HelpCircle, ArrowRight, ExternalLink, Key, Plus, 
  MapPin, Check, PlusCircle, CheckCircle, Info, ChevronRight, Briefcase,
  Star, Award
} from 'lucide-react';
import { Carrier, Contact } from '../types';

interface CarrierGridProps {
  carriers: Carrier[];
  onSelectCarrier: (carrier: Carrier) => void;
  onAddCustomCarrier: (carrier: Carrier) => void;
  favorites: string[];
  onToggleFavorite: (carrierId: string) => void;
}

export default function CarrierGrid({ 
  carriers, 
  onSelectCarrier, 
  onAddCustomCarrier,
  favorites,
  onToggleFavorite
}: CarrierGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<string>('All');
  
  // Advanced Filter state variables
  const [selectedLob, setSelectedLob] = useState<string>('All LOBs');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [hasIncentives, setHasIncentives] = useState(false);
  const [hasActiveHotline, setHasActiveHotline] = useState(false);
  
  // Custom Carrier Add Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSegment, setNewSegment] = useState('Commercial Lines');
  const [newLobRaw, setNewLobRaw] = useState('');
  const [newAgencyCode, setNewAgencyCode] = useState('');
  const [newGeneralAgent, setNewGeneralAgent] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newLogin, setNewLogin] = useState('');
  
  // Unique segments extracted dynamically
  const segments = ['All', 'Commercial Lines', 'Personal Lines', 'MGA', 'General Agent', 'Workers Comp Only', 'Life Insurance', 'Vendor'];

  // Dynamically pull all unique Lines of Business across all active carriers
  const uniqueLobs = ['All LOBs', ...Array.from(new Set(carriers.flatMap(c => c.linesOfBusiness)))].sort();

  const filteredCarriers = carriers.filter(c => {
    // 1. Search Query filter (matches name, agency credentials, lines of business, and write rules)
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      c.name.toLowerCase().includes(query) ||
      (c.agencyCode && c.agencyCode.toLowerCase().includes(query)) ||
      c.linesOfBusiness.some(lob => lob.toLowerCase().includes(query)) ||
      c.appetite.canWrite.some(cw => cw.toLowerCase().includes(query)) ||
      c.appetite.cannotWrite.some(cnw => cnw.toLowerCase().includes(query)) ||
      (c.appetite.notes && c.appetite.notes.toLowerCase().includes(query));

    // 2. Tab Segment Filter
    const matchesSegment = activeSegment === 'All' || c.segment.includes(activeSegment);

    // 3. Line of business filter
    const matchesLob = selectedLob === 'All LOBs' || c.linesOfBusiness.includes(selectedLob);

    // 4. Favorites filter
    const matchesFavorites = !favoritesOnly || favorites.includes(c.id);

    // 5. Incentives presence filter
    const matchesIncentives = !hasIncentives || !!(c.incentives && (c.incentives.commissionRate || c.incentives.levelBonus || c.incentives.paySchedule));

    // 6. Hotline presence filter
    const matchesHotline = !hasActiveHotline || !!(c.appetite && c.appetite.underwritingHotline);

    return matchesSearch && matchesSegment && matchesLob && matchesFavorites && matchesIncentives && matchesHotline;
  });

  const handleCreateCarrier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const customId = `carrier-custom-${Date.now()}`;
    const customCarrier: Carrier = {
      id: customId,
      name: newName.trim(),
      isActive: true,
      segment: [newSegment],
      linesOfBusiness: newLobRaw ? newLobRaw.split(',').map(s => s.trim()) : [],
      agencyCode: newAgencyCode.trim() || undefined,
      generalAgent: newGeneralAgent.trim() || undefined,
      website: newWebsite.trim() || undefined,
      agentLogin: newLogin.trim() || undefined,
      appetite: {
        canWrite: ["Add your custom appetite items under edit..."],
        cannotWrite: ["Add your custom prohibited items under edit..."],
        notes: "Real-time carrier guidelines entry.",
      },
      contacts: []
    };

    onAddCustomCarrier(customCarrier);
    
    // Reset Form
    setNewName('');
    setNewSegment('Commercial Lines');
    setNewLobRaw('');
    setNewAgencyCode('');
    setNewGeneralAgent('');
    setNewWebsite('');
    setNewLogin('');
    setShowAddForm(false);
  };

  // Generate beautiful initials tag color based on name
  const getCarrierColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'from-blue-600 to-blue-800 text-blue-50',
      'from-teal-600 to-emerald-800 text-teal-100',
      'from-slate-700 to-slate-950 text-slate-100',
      'from-amber-600 to-red-800 text-amber-50',
      'from-cyan-600 to-blue-800 text-cyan-50',
      'from-blue-700 to-cyan-900 text-blue-50',
      'from-violet-600 to-fuchsia-800 text-violet-50'
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6">
      
      {/* Search Input and Add Action Control Panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search providers, agency codes, LOBs, or client risk guidelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-450 transition"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 justify-center transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Custom Provider
        </button>
      </div>

      {/* Advanced Underwriting Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row flex-wrap items-center gap-4 justify-between">
          
          {/* LOB Selector */}
          <div className="w-full lg:w-auto flex items-center gap-2 min-w-[240px]">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold shrink-0">Line of Business:</span>
            <select
              value={selectedLob}
              onChange={(e) => setSelectedLob(e.target.value)}
              className="w-full text-[11px] p-2 border border-slate-200 rounded-lg bg-white text-slate-700 font-sans focus:ring-1 focus:ring-blue-600 focus:outline-none"
            >
              {uniqueLobs.map((lob) => (
                <option key={lob} value={lob}>{lob}</option>
              ))}
            </select>
          </div>

          {/* Quick Filters */}
          <div className="w-full lg:w-auto flex flex-wrap gap-4 items-center">
            
            {/* Favorites Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer hover:text-amber-600 transition">
              <input
                type="checkbox"
                checked={favoritesOnly}
                onChange={(e) => setFavoritesOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
                Favorites Only ({favorites.length})
              </span>
            </label>

            {/* Incentives Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer hover:text-blue-600 transition">
              <input
                type="checkbox"
                checked={hasIncentives}
                onChange={(e) => setHasIncentives(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Special commission incentive plans
              </span>
            </label>

            {/* Hotline Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer hover:text-blue-600 transition">
              <input
                type="checkbox"
                checked={hasActiveHotline}
                onChange={(e) => setHasActiveHotline(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                Active Underwriting Hotline
              </span>
            </label>

          </div>

          {/* Clear Indicators Button */}
          {(selectedLob !== 'All LOBs' || favoritesOnly || hasIncentives || hasActiveHotline || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedLob('All LOBs');
                setFavoritesOnly(false);
                setHasIncentives(false);
                setHasActiveHotline(false);
                setSearchQuery('');
              }}
              className="text-[11px] text-red-500 hover:text-red-700 font-semibold hover:underline cursor-pointer"
            >
              Clear All Filters
            </button>
          )}

        </div>
      </div>

      {/* Add Custom Provider Inline Form */}
      {showAddForm && (
        <form onSubmit={handleCreateCarrier} className="bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-4 text-xs font-sans max-w-2xl">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Register Custom Agency Carrier</h3>
            <p className="text-[11px] text-slate-500">Expand your panel with localized GA or specialty programs</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Company Name</label>
              <input 
                type="text" 
                placeholder="e.g. Berkshire Specialty, Amwins Home"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded whitespace-nowrap bg-white text-slate-800 text-xs focus:outline-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Main Segment</label>
              <select
                value={newSegment}
                onChange={(e) => setNewSegment(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded bg-white text-slate-700 font-sans"
              >
                <option value="Commercial Lines">Commercial Lines</option>
                <option value="Personal Lines">Personal Lines</option>
                <option value="MGA">MGA / Brokerage</option>
                <option value="General Agent">General Agent (GA)</option>
                <option value="Workers Comp Only">Workers Comp Specialist</option>
                <option value="Life Insurance">Life & Disability</option>
                <option value="Vendor">Vendor Tools</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">LINES OF BUSINESS (comma separated)</label>
              <input 
                type="text" 
                placeholder="e.g. Workers Compensation, General Liability, Directors & Officers"
                value={newLobRaw}
                onChange={(e) => setNewLobRaw(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded bg-white text-slate-800 text-xs focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Agency Code / Username</label>
              <input 
                type="text" 
                placeholder="e.g. AG-22391"
                value={newAgencyCode}
                onChange={(e) => setNewAgencyCode(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded bg-white text-slate-800 text-xs focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Through General Agent / MGA</label>
              <input 
                type="text" 
                placeholder="e.g. Amwins, CRC, Direct"
                value={newGeneralAgent}
                onChange={(e) => setNewGeneralAgent(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded bg-white text-slate-800 text-xs focus:outline-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Portal Login Address</label>
              <input 
                type="url" 
                placeholder="https://clientportal.com/login"
                value={newLogin}
                onChange={(e) => setNewLogin(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded bg-white text-slate-800 text-xs focus:outline-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Corporate Website Homepage</label>
              <input 
                type="url" 
                placeholder="https://carriername.com"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded bg-white text-slate-800 text-xs focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
            >
              Add Provider
            </button>
          </div>
        </form>
      )}

      {/* Segment Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {segments.map((seg) => (
          <button
            key={seg}
            onClick={() => setActiveSegment(seg)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              activeSegment === seg 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-white text-slate-600 hover:text-blue-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {seg}
          </button>
        ))}
      </div>

      {/* Grid of Carrier Cards / Logos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCarriers.map((carrier) => {
          const logoGradient = getCarrierColor(carrier.name);
          const hasLogo = !!carrier.logoUrl;

          return (
            <div 
              key={carrier.id}
              onClick={() => onSelectCarrier(carrier)}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between group active:scale-[0.99] relative overflow-hidden"
            >
              
              {/* Card visual details */}
              <div className="space-y-4">
                                {/* Logo Section */}
                <div className="flex items-center justify-between">
                  {hasLogo ? (
                    <img 
                      src={carrier.logoUrl} 
                      alt={`${carrier.name} Logo`} 
                      className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 p-1 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${logoGradient} flex items-center justify-center font-bold text-base select-none shadow-sm group-hover:scale-105 transition-transform duration-250`}>
                      {carrier.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                  )}

                  {/* Top-right segment tag and Favorite Star toggle */}
                  <div className="flex items-center gap-1 shrink-0 select-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(carrier.id);
                      }}
                      className="p-1 hover:bg-slate-100 rounded text-amber-500 cursor-pointer"
                      title={favorites.includes(carrier.id) ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Star className={`w-4.5 h-4.5 ${favorites.includes(carrier.id) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                    </button>
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 border border-slate-250 rounded-full truncate max-w-[90px]" title={carrier.segment.join(', ')}>
                      {carrier.segment[0]}
                    </span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-blue-600 transition truncate" title={carrier.name}>
                    {carrier.name}
                  </h4>
                  {carrier.agencyCode && (
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                      <span>Code:</span>
                      <span className="font-bold text-slate-600">{carrier.agencyCode}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="font-mono">GA Access:</span>
                    <span className="font-sans font-bold text-blue-600 bg-blue-50/70 border border-blue-100/50 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wide truncate max-w-[150px]" title={carrier.generalAgent || 'Direct Appointment'}>
                      {carrier.generalAgent || 'Direct'}
                    </span>
                  </div>
                </div>

                {/* Subscribed lines of business description */}
                <div className="space-y-1 min-h-[3.5rem]">
                  <span className="block text-[9px] uppercase font-mono text-slate-400 tracking-wider">Lines of Business</span>
                  <div className="flex flex-wrap gap-1 overflow-hidden max-h-[3rem]">
                    {carrier.linesOfBusiness.slice(0, 2).map((lob, lIdx) => (
                      <span 
                        key={lIdx}
                        className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-500 font-serif truncate max-w-[125px]"
                        title={lob}
                      >
                        {lob}
                      </span>
                    ))}
                    {carrier.linesOfBusiness.length > 2 && (
                      <span className="text-[10px] text-blue-600 font-mono py-0.5">
                        +{carrier.linesOfBusiness.length - 2} more
                      </span>
                    )}
                    {carrier.linesOfBusiness.length === 0 && (
                      <span className="text-[10px] text-slate-400 font-serif italic py-0.5">Commercial LOBs</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Button footer */}
              <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[11px] text-blue-600 font-medium">
                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold">
                  View Appetite & Contacts
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
                
                {carrier.agentLogin && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(carrier.agentLogin, '_blank', 'noreferrer,noopener');
                    }}
                    className="p-1 hover:bg-blue-50 rounded text-blue-600 hover:text-blue-900 transition"
                    title="Open Producer Login Gateway"
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {filteredCarriers.length === 0 && (
          <div className="col-span-full py-12 text-center space-y-3 bg-white border border-slate-100 rounded-3xl">
            <p className="text-sm text-slate-500 italic font-sans">No carriers matched your query criteria.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveSegment('All'); }}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Reset Search Filter
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
