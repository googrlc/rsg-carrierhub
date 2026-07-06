import React, { useState } from 'react';
import { 
  Plus, Check, AlertTriangle, Info, ShieldAlert, Clock, RefreshCw, 
  Trash2, DollarSign, Briefcase, PlusCircle, CheckCircle, Database 
} from 'lucide-react';
import { Carrier, CarrierSystemStatus, GuidelineBulletin, Submission } from '../types';

interface DashboardStatsProps {
  carriers: Carrier[];
  statuses: CarrierSystemStatus[];
  bulletins: GuidelineBulletin[];
  submissions: Submission[];
  onAddBulletin: (bulletin: GuidelineBulletin) => void;
  onRemoveBulletin: (id: string) => void;
  onAddSubmission: (submission: Submission) => void;
  onUpdateSubmissionStatus: (id: string, nextStatus: Submission['status']) => void;
  onRemoveSubmission: (id: string) => void;
  onRefreshStatuses: () => void;
}

export default function DashboardStats({
  carriers,
  statuses,
  bulletins,
  submissions,
  onAddBulletin,
  onRemoveBulletin,
  onAddSubmission,
  onUpdateSubmissionStatus,
  onRemoveSubmission,
  onRefreshStatuses
}: DashboardStatsProps) {
  const [showAddBulletin, setShowAddBulletin] = useState(false);
  const [bulletinTitle, setBulletinTitle] = useState('');
  const [bulletinDesc, setBulletinDesc] = useState('');
  const [bulletinCarrier, setBulletinCarrier] = useState('');
  const [bulletinSeverity, setBulletinSeverity] = useState<GuidelineBulletin['severity']>('info');

  const [showAddSubmission, setShowAddSubmission] = useState(false);
  const [clientName, setClientName] = useState('');
  const [selectedCarrierId, setSelectedCarrierId] = useState('');
  const [lob, setLob] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [volume, setVolume] = useState('');
  const [completedWorksheetIds, setCompletedWorksheetIds] = useState<string[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      onRefreshStatuses();
      setIsRefreshing(false);
    }, 850);
  };

  const handleCreateBulletin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletinTitle.trim() || !bulletinDesc.trim()) return;

    const newBulletin: GuidelineBulletin = {
      id: `bulletin-${Date.now()}`,
      carrierId: bulletinCarrier ? bulletinCarrier : undefined,
      title: bulletinTitle.trim(),
      description: bulletinDesc.trim(),
      severity: bulletinSeverity,
      datePosted: new Date().toISOString(),
      isActive: true
    };

    onAddBulletin(newBulletin);
    setBulletinTitle('');
    setBulletinDesc('');
    setBulletinCarrier('');
    setBulletinSeverity('info');
    setShowAddBulletin(false);
  };

  const handleCreateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !selectedCarrierId || !lob.trim()) return;

    const newSubmission: Submission = {
      id: `sub-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: clientName.trim(),
      carrierId: selectedCarrierId,
      lineOfBusiness: lob.trim(),
      status: 'Submitted',
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      notes: submissionNotes.trim() || 'Form submitted via portal checklist.',
      amount: volume ? parseFloat(volume) : undefined,
      attachedWorksheetIds: completedWorksheetIds
    };

    onAddSubmission(newSubmission);
    setClientName('');
    setSelectedCarrierId('');
    setLob('');
    setSubmissionNotes('');
    setVolume('');
    setCompletedWorksheetIds([]);
    setShowAddSubmission(false);
  };

  const getCarrierName = (id: string) => {
    const matched = carriers.find(c => c.id === id);
    return matched ? matched.name : 'Unknown Carrier';
  };

  // Severity color maps
  const severityColors = {
    info: 'bg-blue-50 text-blue-700 border-blue-100/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-100/60',
    critical: 'bg-red-50 text-red-700 border-red-100/60'
  };

  const severityIcons = {
    info: <Info className="w-4 h-4 text-blue-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    critical: <ShieldAlert className="w-4 h-4 text-red-500" />
  };

  // Submission status badges
  const statusBadges = {
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
    Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    Underwriting: 'bg-purple-50 text-purple-700 border-purple-200',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Declined: 'bg-red-50 text-red-700 border-red-200',
    'Need Info': 'bg-amber-50 text-amber-700 border-amber-200'
  };

  // Portal status styles
  const portalStyles = {
    operational: { bg: 'bg-emerald-500', text: 'text-emerald-700', bgBox: 'bg-emerald-50/50 border-emerald-100' },
    degraded: { bg: 'bg-amber-400', text: 'text-amber-800', bgBox: 'bg-amber-50/50 border-amber-100' },
    down: { bg: 'bg-red-500', text: 'text-red-700', bgBox: 'bg-red-50/50 border-red-100' }
  };

  const responseTimeColors = {
    fast: 'text-emerald-500 font-bold',
    average: 'text-slate-500',
    slow: 'text-amber-500 font-bold'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* 1. CARRIER GATEWAY SYSTEM MONITORING */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-sans font-semibold text-slate-900 text-sm tracking-tight">Carrier Portal Gateways</h3>
            <p className="text-[11px] text-slate-400">Integrated credentials login status</p>
          </div>
          <button 
            onClick={triggerRefresh}
            disabled={isRefreshing}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition disabled:opacity-50"
            title="Refresh active logins"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>

        <div className="space-y-2.5 flex-1 max-h-[385px] overflow-y-auto pr-1">
          {statuses.map((stat, idx) => {
            const style = portalStyles[stat.portalStatus] || portalStyles.operational;
            return (
              <div key={idx} className={`p-3 rounded-xl border ${style.bgBox} text-xs transition-all`}>
                <div className="flex items-center justify-between font-sans">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${style.bg}`} />
                    <span className="font-semibold text-slate-800 truncate max-w-[130px]" title={getCarrierName(stat.carrierId)}>
                      {getCarrierName(stat.carrierId)}
                    </span>
                  </div>
                  <span className={`text-[10px] uppercase font-mono tracking-wide ${style.text}`}>
                    {stat.portalStatus}
                  </span>
                </div>
                
                {stat.statusNote && (
                  <p className="text-slate-500 mt-1 font-sans text-[11px]">{stat.statusNote}</p>
                )}
                
                <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-dotted border-slate-200 text-[10px] text-slate-400 font-mono">
                  <span>API Ping: <span className={responseTimeColors[stat.responseTime]}>{stat.responseTime.toUpperCase()}</span></span>
                  <span>Checked: {new Date(stat.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-50 mt-4 text-[10px] text-slate-400 italic">
          * Portals automatically ping active JWT authorization cookies every 15 minutes.
        </div>
      </div>

      {/* 2. REAL-TIME SUBMISSION BULLETIN BOARD */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-full lg:col-span-1">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-sans font-semibold text-slate-900 text-sm tracking-tight">Guideline Bulletins</h3>
            <p className="text-[11px] text-slate-400">Risk appetite updates & alerts</p>
          </div>
          <button
            onClick={() => setShowAddBulletin(!showAddBulletin)}
            className="p-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Alert
          </button>
        </div>

        {/* Add Bulletin Modal Block */}
        {showAddBulletin && (
          <form onSubmit={handleCreateBulletin} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 mb-4 space-y-3">
            <span className="block text-xs font-semibold text-slate-800">New Guideline Bulletin</span>
            <input 
              type="text" 
              placeholder="Headline / Target LOB (e.g. Roof limitations)" 
              value={bulletinTitle}
              onChange={(e) => setBulletinTitle(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-blue-500"
              required
            />
            <textarea 
              placeholder="Provide exact guidelines description..." 
              value={bulletinDesc}
              onChange={(e) => setBulletinDesc(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-blue-500"
              rows={2}
              required
            />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Carrier Group</label>
                <select 
                  value={bulletinCarrier}
                  onChange={(e) => setBulletinCarrier(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-slate-700"
                >
                  <option value="">Global / All Panel</option>
                  {carriers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Severity</label>
                <select 
                  value={bulletinSeverity}
                  onChange={(e) => setBulletinSeverity(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-slate-700"
                >
                  <option value="info">Info (Standard)</option>
                  <option value="warning">Warning (Substantial)</option>
                  <option value="critical">Critical (Restriction)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                type="button" 
                onClick={() => setShowAddBulletin(false)}
                className="px-2.5 py-1.5 bg-white text-slate-600 rounded text-xs border border-slate-200 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 font-semibold"
              >
                Publish Bulletin
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3 flex-1 max-h-[385px] overflow-y-auto pr-1">
          {bulletins.map((bul) => (
            <div key={bul.id} className={`p-4 rounded-xl border ${severityColors[bul.severity]} text-xs flex gap-3 relative group`}>
              <div className="mt-0.5 shrink-0">
                {severityIcons[bul.severity]}
              </div>
              
              <div className="space-y-1 fill-none flex-1">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-slate-800 font-sans tracking-tight pr-4">
                    {bul.title}
                  </h4>
                  <button 
                    onClick={() => onRemoveBulletin(bul.id)}
                    className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Bulletin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <p className="text-slate-600 leading-relaxed font-sans">{bul.description}</p>
                
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2 text-[10px] text-slate-400 font-mono">
                  {bul.carrierId && (
                    <span className="font-semibold text-blue-700 font-serif">
                      {getCarrierName(bul.carrierId)}
                    </span>
                  )}
                  <span>Posted: {new Date(bul.datePosted).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}

          {bulletins.length === 0 && (
            <div className="text-center py-8 text-slate-400 italic">No guideline bulletins currently issued.</div>
          )}
        </div>
      </div>

      {/* 3. ACTIVE SUBMISSION TRACKER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-full lg:col-span-1">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-sans font-semibold text-slate-900 text-sm tracking-tight">Active Submissions Log</h3>
            <p className="text-[11px] text-slate-400">Track quotes currently in progress</p>
          </div>
          <button
            onClick={() => setShowAddSubmission(!showAddSubmission)}
            className="p-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-semibold flex items-center gap-1 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Proposal
          </button>
        </div>

        {/* Add Submission Form */}
        {showAddSubmission && (
          <form onSubmit={handleCreateSubmission} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 mb-4 space-y-3 text-xs">
            <span className="block text-xs font-semibold text-slate-800">Register Submissions Lead</span>
            
            <input 
              type="text" 
              placeholder="Business Client / DBA name" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800"
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Target Carrier</label>
                <select 
                  value={selectedCarrierId}
                  onChange={(e) => setSelectedCarrierId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-slate-700"
                  required
                >
                  <option value="">Select Carrier...</option>
                  {carriers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Line of Business</label>
                <input 
                  type="text" 
                  placeholder="e.g. BOP, Work Comp" 
                  value={lob}
                  onChange={(e) => setLob(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Estimated Premium Volume (Annual USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type="number" 
                    placeholder="e.g. 2400" 
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full p-2 pl-7 border border-slate-200 rounded bg-white text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* DYNAMIC SUPPLEMENTAL SHEET PROGRESS CHECKLIST */}
            {selectedCarrierId && (() => {
              const carrierObj = carriers.find(c => c.id === selectedCarrierId);
              const worksheets = carrierObj?.worksheets || [];
              if (worksheets.length === 0) return null;
              return (
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-inner">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-sans font-bold text-slate-800 text-[10px] uppercase tracking-wider">Supplemental Worksheets Checklist</span>
                    <span className="text-[9px] text-slate-550 font-bold font-mono">({completedWorksheetIds.length}/{worksheets.length} complete)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Select finalized carrier-specific supplemental documents for this business lead:
                  </p>
                  <div className="space-y-1 max-h-[140px] overflow-y-auto pr-0.5">
                    {worksheets.map(ws => (
                      <label key={ws.id} className="flex items-start gap-2 bg-slate-50 p-2 rounded hover:bg-slate-100 border border-slate-100/80 cursor-pointer text-slate-750">
                        <input
                          type="checkbox"
                          checked={completedWorksheetIds.includes(ws.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCompletedWorksheetIds(prev => [...prev, ws.id]);
                            } else {
                              setCompletedWorksheetIds(prev => prev.filter(id => id !== ws.id));
                            }
                          }}
                          className="w-3.5 h-3.5 mt-0.5 text-blue-600 rounded border-slate-350 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-bold text-[11px] font-sans text-slate-850">{ws.name}</span>
                            {ws.isRequired && <span className="text-[8px] bg-red-100 text-red-700 font-bold px-1 rounded font-mono uppercase shrink-0">REQ</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight">{ws.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })()}

            <textarea 
              placeholder="Underwriting status notes, loss runs context..." 
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800"
              rows={2}
            />

            <div className="flex gap-2 justify-end">
              <button 
                type="button" 
                onClick={() => setShowAddSubmission(false)}
                className="px-2.5 py-1.5 bg-white text-slate-600 rounded text-xs border border-slate-200 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 font-semibold"
              >
                Log Lead
              </button>
            </div>
          </form>
        )}

        {/* Submissions List */}
        <div className="space-y-3 flex-1 max-h-[385px] overflow-y-auto pr-1">
          {submissions.map((sub) => (
            <div key={sub.id} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition shadow-xs relative group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[9px] text-slate-400 uppercase font-black tracking-widest">{sub.id}</span>
                  <div className="flex items-center gap-1.5">
                    {/* Status Dropdown */}
                    <select
                      value={sub.status}
                      onChange={(e) => onUpdateSubmissionStatus(sub.id, e.target.value as any)}
                      className={`text-[10px] px-2 py-0.5 rounded border ${statusBadges[sub.status]} font-medium outline-none focus:ring-1 focus:ring-blue-300`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Underwriting">Underwriting</option>
                      <option value="Approved">Approved</option>
                      <option value="Declined">Declined</option>
                      <option value="Need Info">Need Info</option>
                    </select>

                    <button 
                      onClick={() => onRemoveSubmission(sub.id)}
                      className="text-slate-300 hover:text-red-500 hover:bg-slate-50 p-1 rounded transition opacity-0 group-hover:opacity-100"
                      title="Delete Submission"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h4 className="font-sans font-bold text-slate-800 text-xs">{sub.clientName}</h4>
                
                <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 font-sans">
                  <span className="font-medium text-slate-700">{getCarrierName(sub.carrierId)}</span>
                  <span>•</span>
                  <span className="text-slate-500 italic">{sub.lineOfBusiness}</span>
                </div>

                <p className="text-[10px] text-slate-400 leading-tight mt-1 bg-slate-50 p-1.5 rounded pr-4 italic">
                  {sub.notes}
                </p>

                {sub.attachedWorksheetIds && sub.attachedWorksheetIds.length > 0 && (() => {
                  const carrierObj = carriers.find(c => c.id === sub.carrierId);
                  const attachedWorksheets = carrierObj?.worksheets?.filter(ws => sub.attachedWorksheetIds?.includes(ws.id)) || [];
                  if (attachedWorksheets.length === 0) return null;
                  return (
                    <div className="mt-2 space-y-1 bg-blue-50/20 p-2 rounded-lg border border-blue-100/40">
                      <span className="text-[9px] uppercase font-mono tracking-wide text-slate-500 font-bold block">Finalized Worksheets ({attachedWorksheets.length}):</span>
                      <div className="flex flex-col gap-1">
                        {attachedWorksheets.map(ws => (
                          <div 
                            key={ws.id} 
                            onClick={() => alert(`📄 Viewing associated supplemental worksheet "${ws.name}" completed offline. Status: Attached & Mapped.`)}
                            className="text-[9px] p-1 bg-white hover:bg-blue-50 border border-slate-150 rounded flex items-center justify-between gap-1 cursor-pointer transition text-slate-700"
                          >
                            <span className="truncate max-w-[170px] font-medium font-sans">{ws.name}</span>
                            <span className="font-mono text-[8px] uppercase text-blue-600 font-bold">{ws.fileType}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2.5 pt-1.5 border-t border-slate-50 font-mono">
                <span>Value: <span className="font-semibold text-slate-600">{sub.amount ? `$${sub.amount.toLocaleString()}` : 'TBD'}</span></span>
                <span>Updated: {new Date(sub.dateUpdated).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))}

          {submissions.length === 0 && (
            <div className="text-center py-8 text-slate-400 italic">No submissions registered. Log a lead to track progress.</div>
          )}
        </div>
      </div>

    </div>
  );
}
