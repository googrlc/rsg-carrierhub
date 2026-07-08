import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { 
  Building2, Globe, Shield, RefreshCw, Layers, Bell, CheckSquare, 
  Search, HelpCircle, Compass, Database, UserCheck, Star, AlertCircle, Key
} from 'lucide-react';

import { Carrier, CarrierSystemStatus, GuidelineBulletin, Submission } from './types';
import {
  INITIAL_SYSTEM_STATUSES, INITIAL_SUBMISSIONS, INITIAL_BULLETINS
} from './data/carriers';
import { fetchCarriers, saveCarrier } from './lib/carriers-repo';

import CarrierGrid from './components/CarrierGrid';
import CarrierDrawer from './components/CarrierDrawer';
import DashboardStats from './components/DashboardStats';
import GlobalFinder from './components/GlobalFinder';

export default function App() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [carriersLoading, setCarriersLoading] = useState(true);
  const [carriersError, setCarriersError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<CarrierSystemStatus[]>([]);
  const [bulletins, setBulletins] = useState<GuidelineBulletin[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [activeTab, setActiveTab] = useState<'panel' | 'global-ai' | 'submissions' | 'profile'>('panel');

  const [favorites, setFavorites] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>({
    name: 'Lamar Desk',
    email: 'lamar@risk-solutionsgroup.com',
    role: 'Managing Principal Agent',
    agencyName: 'Risk Solutions Group',
    npn: '99201582'
  });

  // Operational state (statuses, bulletins, submissions, favorites, profile)
  // still lives in localStorage. Carriers now come from Supabase — see below.
  useEffect(() => {
    const cachedStatuses = localStorage.getItem('agency_statuses');
    const cachedBulletins = localStorage.getItem('agency_bulletins');
    const cachedSubmissions = localStorage.getItem('agency_submissions');

    if (cachedStatuses) {
      setStatuses(JSON.parse(cachedStatuses));
    } else {
      setStatuses(INITIAL_SYSTEM_STATUSES);
      localStorage.setItem('agency_statuses', JSON.stringify(INITIAL_SYSTEM_STATUSES));
    }

    if (cachedBulletins) {
      setBulletins(JSON.parse(cachedBulletins));
    } else {
      setBulletins(INITIAL_BULLETINS);
      localStorage.setItem('agency_bulletins', JSON.stringify(INITIAL_BULLETINS));
    }

    if (cachedSubmissions) {
      setSubmissions(JSON.parse(cachedSubmissions));
    } else {
      setSubmissions(INITIAL_SUBMISSIONS);
      localStorage.setItem('agency_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
    }

    const cachedFavorites = localStorage.getItem('agency_favorites');
    const cachedProfile = localStorage.getItem('agency_user_profile');

    if (cachedFavorites) {
      setFavorites(JSON.parse(cachedFavorites));
    } else {
      setFavorites([]);
      localStorage.setItem('agency_favorites', JSON.stringify([]));
    }

    if (cachedProfile) {
      setUserProfile(JSON.parse(cachedProfile));
    } else {
      localStorage.setItem('agency_user_profile', JSON.stringify({
        name: 'Lamar Desk',
        email: 'lamar@risk-solutionsgroup.com',
        role: 'Managing Principal Agent',
        agencyName: 'Risk Solutions Group',
        npn: '99201582'
      }));
    }
  }, []);

  // Load the carrier directory from the box's /api/carriers endpoint (replaces
  // the hardcoded seed). No login — access is gated by the tailnet.
  useEffect(() => {
    let active = true;
    fetchCarriers()
      .then((rows) => {
        if (!active) return;
        setCarriers(rows);
        setCarriersError(null);
      })
      .catch((e) => {
        if (!active) return;
        console.error('Failed to load carriers from Supabase:', e);
        setCarriersError(e?.message ?? 'Failed to load carrier directory.');
      })
      .finally(() => {
        if (active) setCarriersLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Favorite toggling trigger
  const handleToggleFavorite = (carrierId: string) => {
    const nextFavorites = favorites.includes(carrierId)
      ? favorites.filter(id => id !== carrierId)
      : [...favorites, carrierId];
    setFavorites(nextFavorites);
    localStorage.setItem('agency_favorites', JSON.stringify(nextFavorites));
  };

  const handleUpdateProfile = (updatedProfile: any) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('agency_user_profile', JSON.stringify(updatedProfile));
  };

  // Sync helpers
  const handleUpdateCarrier = (updated: Carrier) => {
    const nextArr = carriers.map(c => c.id === updated.id ? updated : c);
    setCarriers(nextArr);
    // Write-through to Supabase (admins only; non-admins keep the local edit).
    saveCarrier(updated).catch(e =>
      console.warn('Carrier save to Supabase failed (kept locally):', e?.message));

    // Also update selected carrier drawer view to avoid stale details fields
    if (selectedCarrier && selectedCarrier.id === updated.id) {
      setSelectedCarrier(updated);
    }
  };

  const handleAddCustomCarrier = (newCarrier: Carrier) => {
    const nextArr = [newCarrier, ...carriers];
    setCarriers(nextArr);
    saveCarrier(newCarrier).catch(e =>
      console.warn('Carrier save to Supabase failed (kept locally):', e?.message));
  };

  const handleAddBulletin = (newBulletin: GuidelineBulletin) => {
    const nextArr = [newBulletin, ...bulletins];
    setBulletins(nextArr);
    localStorage.setItem('agency_bulletins', JSON.stringify(nextArr));
  };

  const handleRemoveBulletin = (id: string) => {
    const nextArr = bulletins.filter(b => b.id !== id);
    setBulletins(nextArr);
    localStorage.setItem('agency_bulletins', JSON.stringify(nextArr));
  };

  const handleAddSubmission = (newSub: Submission) => {
    const nextArr = [newSub, ...submissions];
    setSubmissions(nextArr);
    localStorage.setItem('agency_submissions', JSON.stringify(nextArr));
  };

  const handleUpdateSubmissionStatus = (id: string, nextStatus: Submission['status']) => {
    const nextArr = submissions.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: nextStatus,
          dateUpdated: new Date().toISOString(),
          notes: nextStatus === 'Approved' 
            ? 'Approved on underwriting review. Binder issued.' 
            : s.notes
        };
      }
      return s;
    });
    setSubmissions(nextArr);
    localStorage.setItem('agency_submissions', JSON.stringify(nextArr));
  };

  const handleRemoveSubmission = (id: string) => {
    const nextArr = submissions.filter(s => s.id !== id);
    setSubmissions(nextArr);
    localStorage.setItem('agency_submissions', JSON.stringify(nextArr));
  };

  const handleRefreshStatuses = () => {
    // Modify ping status times dynamically to simulate live background checks
    const refreshed = statuses.map(s => ({
      ...s,
      lastChecked: new Date().toISOString(),
      responseTime: Math.random() > 0.5 ? 'fast' : 'average' as any
    }));
    setStatuses(refreshed);
    localStorage.setItem('agency_statuses', JSON.stringify(refreshed));
  };

  // KPI Calculations
  const activeCarriersCount = carriers.filter(c => c.isActive).length;
  const submissionsVolume = submissions
    .filter(s => s.status !== 'Declined' && s.amount)
    .reduce((sum, s) => sum + (s.amount || 0), 0);
  const portalNormalCount = statuses.filter(s => s.portalStatus === 'operational').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* 1. TOP PREMIUM HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-blue-600 rounded flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-5 h-5 stroke-[2px]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase">CarrierHub</h1>
              <span className="text-slate-400 font-normal">| RSG Broker Portal</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-blue-100">
                {userProfile.name}
              </span>
            </div>
            <p className="text-xs text-slate-500">Universal Carrier Appetite Matrix & Live API Gateways</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Authorized Producer</span>
            <span className="text-xs font-semibold text-slate-700">{userProfile.email}</span>
          </div>
          <div className="flex items-center space-x-2 border-l pl-4 border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 border border-slate-300 font-mono text-sm font-bold flex items-center justify-center">
              {userProfile.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* 2. SUB-HEADER METRICS SUMMARY PORT */}
      <div className="bg-white border-b border-slate-200 p-5 shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* KPI 1 */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">ACTIVE APPOINTMENTS</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 leading-none">{activeCarriersCount}</span>
                <span className="text-xs text-slate-500">/ {carriers.length} registered</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">BIND PIPELINE PREMIUM</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-blue-600 leading-none">${submissionsVolume.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Annual USD</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">PORTAL REFRESH STATE</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 leading-none">{portalNormalCount}</span>
                <span className="text-xs text-slate-500">/ {statuses.length} online</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">SYSTEM VOLUME ALERT</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-500 leading-none">
                  {bulletins.filter(b => b.severity === 'critical' || b.severity === 'warning').length}
                </span>
                <span className="text-xs text-slate-500">Active Warning{bulletins.filter(b => b.severity === 'critical' || b.severity === 'warning').length !== 1 ? 's' : ''}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. MAIN NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-6 mt-6 shrink-0 w-full">
        <div className="border-b border-slate-200">
          <nav className="flex gap-6 -mb-px">
            <button
              onClick={() => setActiveTab('panel')}
              className={`pb-3 px-1 text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
                activeTab === 'panel'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Active Appointments
            </button>
            <button
              onClick={() => setActiveTab('global-ai')}
              className={`pb-3 px-1 text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
                activeTab === 'global-ai'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Universal AI Appetite Index
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`pb-3 px-1 text-xs uppercase font-bold tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'submissions'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Submissions & Guidelines Hub
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-1 text-xs uppercase font-bold tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600 font-bold bg-amber-50/20'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-450" />
              User Profile & Favorites
            </button>
          </nav>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE VIEWS PANELS */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 w-full overflow-hidden">
        
        {/* VIEW 1: LOGO DIRECTORY */}
        {activeTab === 'panel' && (
          carriersError ? (
            <div className="text-center py-20 space-y-2">
              <p className="text-sm font-semibold text-red-600">Couldn't load the carrier directory.</p>
              <p className="text-xs text-slate-400">{carriersError}</p>
            </div>
          ) : carriersLoading ? (
            <div className="text-center py-20 text-sm text-slate-400">Loading carrier directory…</div>
          ) : (
            <CarrierGrid
              carriers={carriers}
              onSelectCarrier={setSelectedCarrier}
              onAddCustomCarrier={handleAddCustomCarrier}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          )
        )}

        {/* VIEW 2: UNIVERSAL AI appetite SEARCH */}
        {activeTab === 'global-ai' && (
          <GlobalFinder carriers={carriers} />
        )}

        {/* VIEW 3: SUBMISSION TRACKER + BULLETIN PANELS */}
        {activeTab === 'submissions' && (
          <DashboardStats
            carriers={carriers}
            statuses={statuses}
            bulletins={bulletins}
            submissions={submissions}
            onAddBulletin={handleAddBulletin}
            onRemoveBulletin={handleRemoveBulletin}
            onAddSubmission={handleAddSubmission}
            onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
            onRemoveSubmission={handleRemoveSubmission}
            onRefreshStatuses={handleRefreshStatuses}
          />
        )}

        {/* VIEW 4: USER PROFILE & FAVORITES HUB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-850 p-6 rounded-2xl text-white shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-white/20 border-2 border-white/40 rounded-full flex items-center justify-center text-white text-xl font-bold font-mono">
                    {userProfile.name ? userProfile.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{userProfile.name}</h2>
                    <p className="text-xs text-white/80">{userProfile.role} • {userProfile.agencyName}</p>
                  </div>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl text-xs space-y-0.5 border border-white/20">
                  <div className="font-mono uppercase text-[9px] text-white/60">National Producer Number (NPN)</div>
                  <div className="font-bold">{userProfile.npn || '99201582'}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Profile Settings Edit Form */}
              <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">Profile Settings</h3>
                  <UserCheck className="w-4 h-4 text-blue-600" />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Full Name</label>
                    <input 
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                      value={userProfile.name}
                      onChange={(e) => handleUpdateProfile({...userProfile, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Email address</label>
                    <input 
                      type="email"
                      className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                      value={userProfile.email}
                      onChange={(e) => handleUpdateProfile({...userProfile, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Role/Title</label>
                    <input 
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                      value={userProfile.role}
                      onChange={(e) => handleUpdateProfile({...userProfile, role: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Agency Name</label>
                    <input 
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                      value={userProfile.agencyName}
                      onChange={(e) => handleUpdateProfile({...userProfile, agencyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Individual NPN</label>
                    <input 
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                      value={userProfile.npn || '99201582'}
                      onChange={(e) => handleUpdateProfile({...userProfile, npn: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Favorited Carrier Portal Quick Jump panel */}
              <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">Favorited Carriers & Portal Shortcuts ({favorites.length})</h3>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {carriers
                    .filter(c => favorites.includes(c.id))
                    .map(carrier => (
                      <div 
                        key={carrier.id}
                        onClick={() => setSelectedCarrier(carrier)}
                        className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600/10 to-indigo-600/5 text-blue-700 border border-slate-205 text-xs font-bold flex items-center justify-center font-mono">
                            {carrier.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{carrier.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{carrier.agencyCode || 'No Code'}</span>
                          </div>
                        </div>

                        {carrier.agentLogin && (
                          <a 
                            href={carrier.agentLogin}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-white text-slate-400 hover:text-blue-600 border border-slate-100 rounded-lg shadow-xs hover:shadow-sm transition-all"
                            title="Open Producer Portal"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}

                  {favorites.length === 0 && (
                    <div className="sm:col-span-2 py-8 text-center space-y-2">
                      <p className="text-xs text-slate-400 italic">No favorited providers tracked yet.</p>
                      <button 
                        onClick={() => setActiveTab('panel')}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Browse Appointments Tab to select favorites Star
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 5. SLIDING SIDE DETAILS DRAWER */}
      <AnimatePresence>
        {selectedCarrier && (
          <CarrierDrawer
            carrier={selectedCarrier}
            onClose={() => setSelectedCarrier(null)}
            onUpdateCarrier={handleUpdateCarrier}
            isFavorite={favorites.includes(selectedCarrier.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedCarrier.id)}
          />
        )}
      </AnimatePresence>

      {/* 6. MODEST BRAND FOOTER */}
      <footer className="bg-slate-100 border-t border-slate-200 py-3 px-6 shrink-0 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-6">
          <span>Version 4.2.1-Stable</span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>All Carrier API Links Online</span>
          </span>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => setActiveTab('panel')} className="hover:text-blue-600">Guideline Library</button>
          <button onClick={() => setActiveTab('global-ai')} className="hover:text-blue-600">Appetite Engine</button>
          <button onClick={() => setActiveTab('submissions')} className="hover:text-blue-600 font-bold">Help Center</button>
        </div>
      </footer>

    </div>
  );
}
