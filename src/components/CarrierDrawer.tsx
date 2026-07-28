import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, AlertTriangle, Info, ShieldAlert, Key, Globe, ExternalLink, 
  Phone, Mail, MapPin, Copy, Send, HelpCircle, Loader2, Plus, Trash2, Edit2,
  Star, Award, Percent, DollarSign, FileText, Download, FileSpreadsheet, Link2
} from 'lucide-react';
import { Carrier, Contact, CarrierWorksheet, AppetiteRecord } from '../types';
import CnaClassLookup from './CnaClassLookup';

interface CarrierDrawerProps {
  carrier: Carrier | null;
  onClose: () => void;
  onUpdateCarrier: (updated: Carrier) => void;
  onDeleteCarrier?: (id: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

// Carrier "type" is stored as the segment array; the card/tag shows segment[0].
const SEGMENT_OPTIONS = ['Commercial Lines', 'Personal Lines', 'MGA', 'General Agent', 'Workers Comp Only', 'Life Insurance', 'Vendor'];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Generic renderer for the open-ended `details` jsonb on an appetite row, so the
// rich per-program detail (target classes, packages, submission requirements,
// endorsements, URLs) shows in the UI without a bespoke field per key.
function humanizeKey(k: string) {
  return k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const DetailValue: React.FC<{ value: any }> = ({ value }) => {
  if (value === null || value === undefined || value === '') return null;
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const allScalar = value.every((v) => v === null || typeof v !== 'object');
    if (allScalar) {
      return (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {value.map((v, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{String(v)}</span>
          ))}
        </div>
      );
    }
    return <div className="space-y-1 mt-0.5">{value.map((v, i) => <DetailValue key={i} value={v} />)}</div>;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== '');
    if (entries.length === 0) return null;
    return (
      <div className="pl-2 border-l border-slate-150 space-y-1 mt-0.5">
        {entries.map(([k, v]) => (
          <div key={k} className="text-[11px]">
            <span className="text-slate-400 font-mono">{humanizeKey(k)}</span>
            <DetailValue value={v} />
          </div>
        ))}
      </div>
    );
  }
  const s = String(value);
  if (/^https?:\/\//.test(s)) {
    return <a href={s} target="_blank" referrerPolicy="no-referrer" className="text-blue-600 hover:underline break-all"> {s}</a>;
  }
  return <span className="text-slate-600"> {s}</span>;
};

function AppetiteDetails({ details }: { details?: Record<string, unknown> }) {
  if (!details) return null;
  const entries = Object.entries(details).filter(
    ([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
  );
  if (entries.length === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
      {entries.map(([k, v]) => (
        <div key={k} className="text-[11px]">
          <span className="text-slate-500 font-semibold font-mono uppercase tracking-wide">{humanizeKey(k)}</span>
          <DetailValue value={v} />
        </div>
      ))}
    </div>
  );
}

export default function CarrierDrawer({ carrier, onClose, onUpdateCarrier, onDeleteCarrier, isFavorite, onToggleFavorite }: CarrierDrawerProps) {
  const [activeTab, setActiveTab] = useState<'appetite' | 'appetite-matrix' | 'contacts' | 'ai-advisor' | 'credentials' | 'incentives' | 'worksheets' | 'classes'>('appetite');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // AI Advisor Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isAskingAi, setIsAskingAi] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Editing Carrier fields
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSegment, setEditSegment] = useState('Commercial Lines');
  const [editCode, setEditCode] = useState('');
  const [editGA, setEditGA] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLogin, setEditLogin] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editCanWrite, setEditCanWrite] = useState<string[]>([]);
  const [editCannotWrite, setEditCannotWrite] = useState<string[]>([]);
  const [newCanWriteItem, setNewCanWriteItem] = useState('');
  const [newCannotWriteItem, setNewCannotWriteItem] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editHotline, setEditHotline] = useState('');
  
  // Incentives fields
  const [editIncentiveCommission, setEditIncentiveCommission] = useState('');
  const [editIncentiveBonus, setEditIncentiveBonus] = useState('');
  const [editIncentiveTier, setEditIncentiveTier] = useState('');
  const [editIncentiveNotes, setEditIncentiveNotes] = useState('');
  
  // Structured Appetite (carrier_appetite spine) Editor State
  const [editAppetiteRows, setEditAppetiteRows] = useState<AppetiteRecord[]>([]);
  const [newAppLob, setNewAppLob] = useState('');
  const [newAppLevel, setNewAppLevel] = useState('');
  const [newAppMinPrem, setNewAppMinPrem] = useState('');
  const [newAppMaxPrem, setNewAppMaxPrem] = useState('');
  const [newAppStates, setNewAppStates] = useState('');
  const [newAppClassCodes, setNewAppClassCodes] = useState('');
  const [newAppRequirements, setNewAppRequirements] = useState('');
  const [newAppExclusions, setNewAppExclusions] = useState('');
  const [newAppNotes, setNewAppNotes] = useState('');
  const [newAppConfidence, setNewAppConfidence] = useState('unverified');

  // Flip an existing appetite row between verified / unverified in place.
  // Without this, confidence was write-once-as-'unverified' and no row
  // could ever be promoted to verified through the UI.
  const handleToggleAppetiteConfidence = (idx: number) => {
    setEditAppetiteRows(prev =>
      prev.map((r, i) =>
        i === idx
          ? { ...r, confidence: r.confidence === 'verified' ? 'unverified' : 'verified' }
          : r,
      ),
    );
  };

  // Contact Editor State
  const [editContacts, setEditContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRegion, setNewContactRegion] = useState('');

  // Worksheets Editor State
  const [editWorksheets, setEditWorksheets] = useState<CarrierWorksheet[]>([]);
  const [newWorksheetName, setNewWorksheetName] = useState('');
  const [newWorksheetDesc, setNewWorksheetDesc] = useState('');
  const [newWorksheetLob, setNewWorksheetLob] = useState('');
  const [newWorksheetRequired, setNewWorksheetRequired] = useState(false);
  const [newWorksheetType, setNewWorksheetType] = useState<'pdf' | 'xlsx' | 'docx' | 'link'>('pdf');
  const [newWorksheetSize, setNewWorksheetSize] = useState('250 KB');

  // Initialize/Reset edits when carrier changes
  useEffect(() => {
    if (carrier) {
      setEditName(carrier.name);
      setEditSegment(carrier.segment?.[0] || 'Commercial Lines');
      setEditCode(carrier.agencyCode || '');
      setEditGA(carrier.generalAgent || '');
      setEditWebsite(carrier.website || '');
      setEditLogin(carrier.agentLogin || '');
      setEditLogoUrl(carrier.logoUrl || '');
      setEditCanWrite([...carrier.appetite.canWrite]);
      setEditCannotWrite([...carrier.appetite.cannotWrite]);
      setEditNotes(carrier.appetite.notes || '');
      setEditHotline(carrier.appetite.underwritingHotline || '');
      setEditContacts([...carrier.contacts]);
      setEditAppetiteRows((carrier.appetiteRows || []).map(r => ({ ...r })));
      setEditIncentiveCommission(carrier.incentives?.commissionRate || '');
      setEditIncentiveBonus(carrier.incentives?.levelBonus || '');
      setEditIncentiveTier(carrier.incentives?.preferredTier || '');
      setEditIncentiveNotes(carrier.incentives?.notes || '');
      setEditWorksheets(carrier.worksheets || []);
      
      // Reset AI Chat for new carrier
      setMessages([
        { 
          role: 'assistant', 
          content: `👋 Hello! I am the automated appetite concierge for **${carrier.name}**. Ask me any specific risk inquiry or profile details, and I will double-check against our current underwriting submission guidelines!` 
        }
      ]);
    }
    setIsEditing(false);
  }, [carrier]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAskingAi]);

  if (!carrier) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleSendAiMessage = async (textToSend?: string) => {
    const textMsg = textToSend || inputVal;
    if (!textMsg.trim() || isAskingAi) return;

    const userMessage: ChatMessage = { role: 'user', content: textMsg };
    setMessages(prev => [...prev, userMessage]);
    
    if (!textToSend) {
      setInputVal('');
    }
    setIsAskingAi(true);

    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // The id lets the server re-read this carrier's live appetite spine
          // (class codes, states, premium bands, contacts) instead of relying on
          // the prose summary below, which carries none of it.
          carrierId: carrier.id,
          carrierName: carrier.name,
          appetiteInfo: {
            segment: carrier.segment,
            linesOfBusiness: carrier.linesOfBusiness,
            canWrite: editCanWrite,
            cannotWrite: editCannotWrite,
            notes: editNotes
          },
          inquiry: textMsg,
          history: messages.slice(1) // omit introductory message for AI brevity
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ **Failed to retrieve underwriting response**: ${err.message}. Please verify the carrier server connector is running and your API Key is specified correctly.` 
      }]);
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleSaveCarrierEdits = () => {
    const updatedCarrier: Carrier = {
      ...carrier,
      name: editName,
      segment: editSegment ? [editSegment] : carrier.segment,
      agencyCode: editCode,
      generalAgent: editGA.trim() || undefined,
      website: editWebsite,
      agentLogin: editLogin,
      logoUrl: editLogoUrl || undefined,
      appetite: {
        canWrite: editCanWrite,
        cannotWrite: editCannotWrite,
        notes: editNotes,
        underwritingHotline: editHotline
      },
      contacts: editContacts,
      appetiteRows: editAppetiteRows,
      worksheets: editWorksheets,
      incentives: {
        commissionRate: editIncentiveCommission || undefined,
        levelBonus: editIncentiveBonus || undefined,
        preferredTier: editIncentiveTier || undefined,
        notes: editIncentiveNotes || undefined
      }
    };
    onUpdateCarrier(updatedCarrier);
    setIsEditing(false);
  };

  // List modification helpers
  const handleAddCanWrite = () => {
    if (newCanWriteItem.trim()) {
      setEditCanWrite([...editCanWrite, newCanWriteItem.trim()]);
      setNewCanWriteItem('');
    }
  };

  const handleRemoveCanWrite = (index: number) => {
    setEditCanWrite(editCanWrite.filter((_, i) => i !== index));
  };

  const handleAddCannotWrite = () => {
    if (newCannotWriteItem.trim()) {
      setEditCannotWrite([...editCannotWrite, newCannotWriteItem.trim()]);
      setNewCannotWriteItem('');
    }
  };

  const handleRemoveCannotWrite = (index: number) => {
    setEditCannotWrite(editCannotWrite.filter((_, i) => i !== index));
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactRole.trim()) return;
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name: newContactName.trim(),
      role: newContactRole.trim(),
      email: newContactEmail.trim(),
      phone: newContactPhone.trim(),
      region: newContactRegion.trim() || undefined
    };
    setEditContacts([...editContacts, newContact]);
    setNewContactName('');
    setNewContactRole('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactRegion('');
  };

  const handleRemoveContact = (id: string) => {
    setEditContacts(editContacts.filter(c => c.id !== id));
  };

  // Structured appetite row helpers. Array fields are entered comma-separated.
  const splitList = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);

  const handleAddAppetiteRow = () => {
    if (!newAppLob.trim()) {
      alert('A Line of Business is required to add an appetite row.');
      return;
    }
    const row: AppetiteRecord = {
      lob: newAppLob.trim(),
      appetiteLevel: newAppLevel || undefined,
      minPremium: newAppMinPrem.trim() ? Number(newAppMinPrem) : null,
      maxPremium: newAppMaxPrem.trim() ? Number(newAppMaxPrem) : null,
      statesApproved: splitList(newAppStates.toUpperCase()),
      classCodes: splitList(newAppClassCodes),
      keyRequirements: splitList(newAppRequirements),
      exclusions: splitList(newAppExclusions),
      notes: newAppNotes.trim() || undefined,
      details: {},
      active: true,
      source: 'carrier-hub-ui',
      confidence: newAppConfidence,
    };
    setEditAppetiteRows(prev => [...prev, row]);
    setNewAppLob(''); setNewAppLevel(''); setNewAppMinPrem(''); setNewAppMaxPrem('');
    setNewAppStates(''); setNewAppClassCodes(''); setNewAppRequirements('');
    setNewAppExclusions(''); setNewAppNotes(''); setNewAppConfidence('unverified');
  };

  const handleRemoveAppetiteRow = (idx: number) => {
    setEditAppetiteRows(prev => prev.filter((_, i) => i !== idx));
  };

  // Generate Monogram color based on name
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

  const logoClasses = getCarrierColor(carrier.name);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
      />

      {/* Slideout Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 border-l border-slate-100"
      >
        {/* Underwriting Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {carrier.logoUrl || editLogoUrl ? (
              <img 
                src={editLogoUrl || carrier.logoUrl} 
                alt={`${carrier.name} Logo`} 
                className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 p-1"
                onError={(e) => {
                  // Fallback if logo fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${logoClasses} flex items-center justify-center font-bold text-lg select-none shadow-xs shrink-0`}>
                {carrier.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            )}
            <div>
              <h2 className="text-xl font-sans font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border border-slate-200 px-2 py-0.5 rounded text-sm font-medium w-80 bg-white"
                  />
                ) : (
                  carrier.name
                )}
                {!carrier.isActive && (
                  <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 font-normal">Inactive</span>
                )}
              </h2>
              <div className="flex flex-wrap gap-1 mt-1 items-center">
                {isEditing ? (
                  <>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Type</span>
                    <select
                      value={editSegment}
                      onChange={(e) => setEditSegment(e.target.value)}
                      className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                    >
                      {SEGMENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  carrier.segment.map((seg, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                      {seg}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isFavorite 
                  ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-100 bg-amber-50' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-150 bg-slate-50 border border-slate-150'
              }`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Edit Carrier Details"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSaveCarrierEdits}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setConfirmDelete(false);
                    // Reset fields
                    setEditName(carrier.name);
                    setEditSegment(carrier.segment?.[0] || 'Commercial Lines');
                    setEditCanWrite([...carrier.appetite.canWrite]);
                    setEditCannotWrite([...carrier.appetite.cannotWrite]);
                    setEditContacts([...carrier.contacts]);
                  }}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                {onDeleteCarrier && (
                  confirmDelete ? (
                    <button
                      onClick={() => { onDeleteCarrier(carrier.id); }}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition flex items-center gap-1"
                      title="Permanently delete this carrier (and its contacts + appetite rows)"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Confirm delete
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete carrier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-white px-2">
          <button
            onClick={() => setActiveTab('appetite')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'appetite' 
                ? 'border-blue-600 text-blue-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Risk Appetite
          </button>
          <button
            onClick={() => setActiveTab('appetite-matrix')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'appetite-matrix'
                ? 'border-blue-600 text-blue-600 font-bold bg-emerald-50/25'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40'
            }`}
            title="Structured, queryable appetite by line of business"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Appetite Matrix ({isEditing ? editAppetiteRows.length : (carrier.appetiteRows?.length || 0)})
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'credentials' 
                ? 'border-blue-600 text-blue-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Credentials & Logins
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'contacts' 
                ? 'border-blue-600 text-blue-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Underwriting Contacts ({isEditing ? editContacts.length : carrier.contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('incentives')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-1 ${
              activeTab === 'incentives' 
                ? 'border-blue-600 text-blue-600 font-bold bg-amber-50/20' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Incentives & Tier Commissions
          </button>
          <button
            onClick={() => setActiveTab('worksheets')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'worksheets' 
                ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/25' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            Supplemental Worksheets ({isEditing ? editWorksheets.length : (carrier.worksheets?.length || 0)})
          </button>
          {carrier.id === 'cna-insurance' && (
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'classes'
                  ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/25'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Class Code Lookup
            </button>
          )}
          <button
            onClick={() => setActiveTab('ai-advisor')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'ai-advisor' 
                ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/20' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            AI Underwriting Advisor
          </button>
        </div>

        {/* Active Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* RISK APPETITE VIEW */}
          {activeTab === 'appetite' && (
            <div className="space-y-6">
              {/* LOB Listing */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Supported Lines of Business</h4>
                <div className="flex flex-wrap gap-1.5">
                  {carrier.linesOfBusiness.length > 0 ? (
                    carrier.linesOfBusiness.map((lob, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-serif border border-blue-100 rounded">
                        {lob}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No specific Lines of Business explicit in original rows. Defaults apply.</span>
                  )}
                </div>
              </div>

              {/* Guidelines / Can & Cannot Write Split Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CAN WRITE */}
                <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-50">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                    <span className="font-sans font-semibold text-slate-800 text-sm">Target Appetite (Will Write)</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 flex-1">
                    {editCanWrite.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span className="flex-1">{item}</span>
                        {isEditing && (
                          <button 
                            onClick={() => handleRemoveCanWrite(idx)}
                            className="text-red-400 hover:text-red-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                    {editCanWrite.length === 0 && (
                      <span className="text-slate-400 italic">No standard guidelines listed yet.</span>
                    )}
                  </ul>

                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-1">
                      <input 
                        type="text"
                        placeholder="Add targeted appetite entry..."
                        value={newCanWriteItem}
                        onChange={(e) => setNewCanWriteItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCanWrite()}
                        className="border border-slate-200 rounded px-2 py-1 text-xs flex-1 bg-white"
                      />
                      <button 
                        onClick={handleAddCanWrite}
                        className="p-1 px-2.5 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {/* CANNOT WRITE */}
                <div className="bg-white p-5 rounded-xl border border-red-100 shadow-xs flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-50">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5px]" />
                    </div>
                    <span className="font-sans font-semibold text-slate-800 text-sm">Prohibited (Won't Write)</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 flex-1">
                    {editCannotWrite.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        <span className="flex-1">{item}</span>
                        {isEditing && (
                          <button 
                            onClick={() => handleRemoveCannotWrite(idx)}
                            className="text-red-400 hover:text-red-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                    {editCannotWrite.length === 0 && (
                      <span className="text-slate-400 italic">No specific Prohibited items listed yet.</span>
                    )}
                  </ul>

                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-1">
                      <input 
                        type="text"
                        placeholder="Add prohibited entry..."
                        value={newCannotWriteItem}
                        onChange={(e) => setNewCannotWriteItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCannotWrite()}
                        className="border border-slate-200 rounded px-2 py-1 text-xs flex-1 bg-white"
                      />
                      <button 
                        onClick={handleAddCannotWrite}
                        className="p-1 px-2.5 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Special Underwriter Notes */}
              <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="font-sans font-semibold text-slate-800 text-sm">Underwriting Context & Notes</span>
                </div>
                {isEditing ? (
                  <textarea 
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-blue-500 bg-white"
                  />
                ) : (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-serif">
                    {carrier.appetite.notes || "No special underwriting guidelines noted. Click Edit to fill this section."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STRUCTURED APPETITE MATRIX VIEW */}
          {activeTab === 'appetite-matrix' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-600/5 p-5 rounded-2xl border border-emerald-200/50 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-600 rounded-lg text-white">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-slate-900 text-sm">Structured Appetite Matrix</h4>
                    <p className="text-[11px] text-slate-500">
                      Queryable appetite by line of business — feeds the AI advisor and agency analytics. One row per LOB.
                    </p>
                  </div>
                </div>

                {/* Existing rows */}
                <div className="space-y-2.5 pt-1">
                  {editAppetiteRows.map((row, idx) => {
                    const levelColor =
                      row.appetiteLevel === 'preferred' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : row.appetiteLevel === 'standard' ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : row.appetiteLevel === 'non-standard' ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200';
                    return (
                      <div key={row.id || `new-${idx}`} className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-sans font-bold text-slate-800 text-sm">{row.lob}</span>
                            {row.appetiteLevel && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${levelColor}`}>
                                {row.appetiteLevel}
                              </span>
                            )}
                            {row.confidence && row.confidence !== 'verified' && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 font-mono">{row.confidence}</span>
                            )}
                            {row.confidence === 'verified' && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 font-mono">verified</span>
                            )}
                          </div>
                          {isEditing && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleToggleAppetiteConfidence(idx)}
                                className={`text-[9px] px-2 py-1 rounded border font-mono font-bold transition cursor-pointer ${
                                  row.confidence === 'verified'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                }`}
                                title={
                                  row.confidence === 'verified'
                                    ? 'Confirmed with the carrier. Click to mark unverified.'
                                    : 'Not confirmed with the carrier. Click to mark verified.'
                                }
                              >
                                {row.confidence === 'verified' ? '✓ VERIFIED' : 'MARK VERIFIED'}
                              </button>
                              <button
                                onClick={() => handleRemoveAppetiteRow(idx)}
                                className="p-1 text-red-400 hover:text-red-600 transition"
                                title="Remove appetite row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2.5 text-[11px] text-slate-600">
                          {(row.minPremium != null || row.maxPremium != null) && (
                            <div><span className="text-slate-400 font-mono">PREMIUM </span>${row.minPremium ?? '?'} – ${row.maxPremium ?? '?'}</div>
                          )}
                          {row.statesApproved && row.statesApproved.length > 0 && (
                            <div><span className="text-slate-400 font-mono">STATES </span>{row.statesApproved.join(', ')}</div>
                          )}
                          {row.classCodes && row.classCodes.length > 0 && (
                            <div className="sm:col-span-2"><span className="text-slate-400 font-mono">CLASS CODES </span>{row.classCodes.join(', ')}</div>
                          )}
                          {row.keyRequirements && row.keyRequirements.length > 0 && (
                            <div className="sm:col-span-2"><span className="text-emerald-600 font-mono">REQUIRES </span>{row.keyRequirements.join('; ')}</div>
                          )}
                          {row.exclusions && row.exclusions.length > 0 && (
                            <div className="sm:col-span-2"><span className="text-red-500 font-mono">EXCLUDES </span>{row.exclusions.join('; ')}</div>
                          )}
                          {row.notes && (
                            <div className="sm:col-span-2 text-slate-500 font-serif pt-0.5">{row.notes}</div>
                          )}
                        </div>

                        {/* Full open-ended detail (target classes, packages, submission reqs, endorsements, URLs) */}
                        <AppetiteDetails details={row.details as Record<string, unknown> | undefined} />
                      </div>
                    );
                  })}

                  {editAppetiteRows.length === 0 && (
                    <div className="bg-white/50 p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 italic text-xs">
                      No structured appetite rows yet. {isEditing ? 'Add one below.' : 'Click Edit above to add queryable appetite by line of business.'}
                    </div>
                  )}
                </div>

                {/* Add row form */}
                {isEditing && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                    <span className="block font-bold text-slate-800 border-b pb-1">Add Appetite Row</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Line of Business *</label>
                        <input
                          type="text"
                          placeholder="e.g. Workers Comp"
                          value={newAppLob}
                          onChange={(e) => setNewAppLob(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Appetite Level</label>
                        <select
                          value={newAppLevel}
                          onChange={(e) => setNewAppLevel(e.target.value)}
                          className="w-full p-2 border border-slate-250 rounded bg-white text-slate-700"
                        >
                          <option value="">— unset —</option>
                          <option value="preferred">Preferred</option>
                          <option value="standard">Standard</option>
                          <option value="non-standard">Non-standard</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Min $</label>
                          <input type="number" placeholder="500" value={newAppMinPrem}
                            onChange={(e) => setNewAppMinPrem(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Max $</label>
                          <input type="number" placeholder="50000" value={newAppMaxPrem}
                            onChange={(e) => setNewAppMaxPrem(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Approved States (comma-sep)</label>
                        <input type="text" placeholder="GA, FL, TX" value={newAppStates}
                          onChange={(e) => setNewAppStates(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Class Codes (comma-sep)</label>
                        <input type="text" placeholder="87210, 51992" value={newAppClassCodes}
                          onChange={(e) => setNewAppClassCodes(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Key Requirements (comma-sep)</label>
                        <input type="text" placeholder="Valid CDL, No violations 3yrs" value={newAppRequirements}
                          onChange={(e) => setNewAppRequirements(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Exclusions (comma-sep)</label>
                        <input type="text" placeholder="Livery/TNC, Salvage title" value={newAppExclusions}
                          onChange={(e) => setNewAppExclusions(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Confidence</label>
                        <select value={newAppConfidence}
                          onChange={(e) => setNewAppConfidence(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white">
                          <option value="unverified">Unverified — not confirmed with carrier</option>
                          <option value="verified">Verified — confirmed with underwriter</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Notes</label>
                      <textarea rows={2} placeholder="Any nuance — carrier program, sub-market steer, etc."
                        value={newAppNotes} onChange={(e) => setNewAppNotes(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white" />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAppetiteRow}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Appetite Row
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CREDENTIALS VIEW */}
          {activeTab === 'credentials' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="font-sans font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2">Agency Credentials</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Agency Code */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-xs font-mono text-slate-400 mb-1">AGENCY PRODUCER CODE</span>
                    <div className="flex items-center justify-between">
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value)}
                          className="border border-slate-200 px-2 py-0.5 rounded text-xs font-semibold w-full bg-white text-slate-800"
                        />
                      ) : (
                        <span className="text-sm font-mono font-bold text-slate-800">{carrier.agencyCode || 'NOT ASSIGNED'}</span>
                      )}
                      {!isEditing && carrier.agencyCode && (
                        <button 
                          onClick={() => handleCopy(carrier.agencyCode || '', 'code')}
                          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {copiedField === 'code' && (
                      <span className="text-[10px] text-blue-600 font-medium">Copied!</span>
                    )}
                  </div>

                  {/* General Agent Access */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-xs font-mono text-slate-400 mb-1">GENERAL AGENT / PATHWAY</span>
                    <div className="flex items-center justify-between">
                      {isEditing ? (
                        <input 
                          type="text"
                          placeholder="e.g. Amwins, CRC, Direct"
                          value={editGA}
                          onChange={(e) => setEditGA(e.target.value)}
                          className="border border-slate-200 px-2 py-0.5 rounded text-xs font-semibold w-full bg-white text-slate-800 font-sans"
                        />
                      ) : (
                        <span className="text-sm font-sans font-bold text-blue-650 text-blue-600 uppercase tracking-wide">
                          {carrier.generalAgent || 'Direct Appointment'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hotline */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-xs font-mono text-slate-400 mb-1">UNDERWRITING PHONE HOTLINE</span>
                    <div className="flex items-center justify-between">
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editHotline}
                          onChange={(e) => setEditHotline(e.target.value)}
                          className="border border-slate-200 px-2 py-0.5 rounded text-xs font-semibold w-full bg-white text-slate-800"
                        />
                      ) : (
                        <span className="text-sm font-mono font-bold text-slate-800">{carrier.appetite.underwritingHotline || 'None Listed'}</span>
                      )}
                      {!isEditing && carrier.appetite.underwritingHotline && (
                        <a 
                          href={`tel:${carrier.appetite.underwritingHotline}`}
                          className="p-1 hover:bg-slate-200 rounded text-blue-500 hover:text-blue-700 transition"
                          title="Call Hotline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Portal Logo link setup during Edit Mode */}
                {isEditing && (
                  <div className="pt-2">
                    <label className="block text-xs font-mono text-slate-400 mb-1">CUSTOM LOGO IMAGE URL (Optional)</label>
                    <input 
                      type="text"
                      placeholder="https://example.com/carrier-logo-direct.png"
                      value={editLogoUrl}
                      onChange={(e) => setEditLogoUrl(e.target.value)}
                      className="w-full border border-slate-200 px-2.5 py-1.5 rounded text-xs focus:outline-blue-500 bg-white"
                    />
                    <span className="text-[10px] text-slate-400">Provide an absolute image URL to replace the default initials emblem.</span>
                  </div>
                )}

                {/* External Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  {/* Website */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">CORPORATE WEBSITE</label>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editWebsite}
                        onChange={(e) => setEditWebsite(e.target.value)}
                        className="w-full border border-slate-200 px-2 py-1 rounded text-xs bg-white"
                      />
                    ) : (
                      carrier.website ? (
                        <a 
                          href={carrier.website} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold w-full justify-center transition"
                        >
                          <Globe className="w-4 h-4 text-slate-500" />
                          Visit Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No corporate link.</span>
                      )
                    )}
                  </div>

                  {/* Agent Login */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">AGENT SECURE LOGIN GATEWAY</label>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editLogin}
                        onChange={(e) => setEditLogin(e.target.value)}
                        className="w-full border border-slate-200 px-2 py-1 rounded text-xs bg-white"
                      />
                    ) : (
                      carrier.agentLogin ? (
                        <a 
                          href={carrier.agentLogin} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-semibold w-full justify-center transition shadow-xs"
                        >
                          <Key className="w-4 h-4" />
                          Open Producer Portal
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No login portal link listed.</span>
                      )
                    )}
                  </div>
                </div>

                {/* Original SharePoint Information */}
                {carrier.originalLogoPath && (
                  <div className="pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-100/60">
                    Sharepoint original: <span className="break-all">{carrier.originalLogoPath}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* UNDERWRITING CONTACTS VIEW */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className="space-y-3">
                {editContacts.map((contact) => (
                  <div key={contact.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-start justify-between gap-4 group">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans font-semibold text-slate-800 text-sm">{contact.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {contact.role}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5 text-xs text-slate-500">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-blue-600 transition truncate">
                            <Mail className="w-3.5 h-3.5" />
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 hover:text-blue-600 transition">
                            <Phone className="w-3.5 h-3.5" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.region && (
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="w-3.5 h-3.5" />
                            {contact.region}
                          </span>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveContact(contact.id)}
                        className="p-1 text-red-400 hover:text-red-600 transition"
                        title="Remove Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {editContacts.length === 0 && (
                  <div className="bg-white p-6 rounded-xl border border-slate-100 text-center space-y-2">
                    <p className="text-xs text-slate-500 italic">No underwriting contacts registered for this carrier yet.</p>
                  </div>
                )}
              </div>

              {/* Add New Contact Form */}
              {isEditing && (
                <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100/60 space-y-3">
                  <span className="block text-xs font-sans font-semibold text-blue-950">Add New Underwriter Contact</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="text"
                      placeholder="Name (e.g. Robert Smith)"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-indigo-500"
                    />
                    <input 
                      type="text"
                      placeholder="Role (e.g. Senior Underwriter)"
                      value={newContactRole}
                      onChange={(e) => setNewContactRole(e.target.value)}
                      className="border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-blue-500"
                    />
                    <input 
                      type="email"
                      placeholder="Email Address"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      className="border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-indigo-500"
                    />
                    <input 
                      type="text"
                      placeholder="Phone"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-indigo-500"
                    />
                    <input 
                      type="text"
                      placeholder="Region Coverage (e.g. West Coast)"
                      value={newContactRegion}
                      onChange={(e) => setNewContactRegion(e.target.value)}
                      className="border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-indigo-500 sm:col-span-2"
                    />
                  </div>

                  <button
                    onClick={handleAddContact}
                    className="w-full py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    Insert Contact
                  </button>
                </div>
              )}
            </div>
          )}

          {/* INCENTIVES & DIRECT TIERS VIEW */}
          {activeTab === 'incentives' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-5 rounded-2xl border border-amber-200/50 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500 rounded-lg text-white">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-slate-900 text-sm">Carrier Incentives, Commission Structures & Tiers</h4>
                    <p className="text-[11px] text-slate-500">View and update special agency agreements and volume quotas</p>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {/* CommRate Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase font-bold font-sans">
                        <Percent className="w-3.5 h-3.5 text-blue-500" />
                        Base Commission
                      </div>
                      <span className="text-lg font-black text-slate-900">
                        {editIncentiveCommission || '12.5% Standard'}
                      </span>
                    </div>

                    {/* Bonus Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase font-bold font-sans">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        Bonus Program
                      </div>
                      <span className="text-lg font-black text-slate-900 block truncate" title={editIncentiveBonus || 'Standard Scale'}>
                        {editIncentiveBonus || 'None Registered'}
                      </span>
                    </div>

                    {/* Tier Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase font-bold font-sans">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        Appointment Tier
                      </div>
                      <span className="text-lg font-black text-slate-900">
                        {editIncentiveTier || 'Standard Broker'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 bg-white/70 p-4 rounded-xl border border-slate-250">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono uppercase font-bold mb-1">Base Commission</label>
                      <input
                        type="text"
                        placeholder="e.g. 15.0% BOP, 10% WC"
                        value={editIncentiveCommission}
                        onChange={(e) => setEditIncentiveCommission(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono uppercase font-bold mb-1">Bonus Structure</label>
                      <input
                        type="text"
                        placeholder="e.g. +2% at $150k volume"
                        value={editIncentiveBonus}
                        onChange={(e) => setEditIncentiveBonus(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono uppercase font-bold mb-1">Appointment Tier</label>
                      <input
                        type="text"
                        placeholder="e.g. Preferred Elite / Select"
                        value={editIncentiveTier}
                        onChange={(e) => setEditIncentiveTier(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Notes block */}
                <div className="bg-white/80 p-4 rounded-xl border border-slate-100/80 text-xs">
                  <span className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1.5">Incentives notes & qualification guidelines</span>
                  {!isEditing ? (
                    <p className="text-slate-600 leading-relaxed font-sans">
                      {editIncentiveNotes || 'No custom qualification details added. Direct appointments qualify for our primary master brokerage schedules. Edit this segment to specify custom notes.'}
                    </p>
                  ) : (
                    <textarea
                      placeholder="Specify custom rules, year-end bonus programs, or premium hurdles..."
                      value={editIncentiveNotes}
                      onChange={(e) => setEditIncentiveNotes(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-blue-500 bg-white"
                      rows={3}
                    />
                  )}
                </div>
              </div>

              {/* Portal FAQ & Live Connection Explainer Grid */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  Integration Directives FAQ
                </h4>

                <div className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <h5 className="font-semibold text-slate-900">Are these live links to the carrier portals?</h5>
                    <p className="text-slate-500 leading-relaxed">
                      Yes! The login triggers (marked with key icon) use active production links. For custom credentials, clicking 'Open Producer Portal' opens a new target window to bypass frame sandbox limitations gracefully.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-semibold text-slate-900">How do I add carriers, custom appetite guidelines, and incentives?</h5>
                    <p className="text-slate-500 leading-relaxed">
                      You can register fresh custom carriers directly using the <strong>Register Custom Agency Carrier</strong> tool at the bottom-right of your Active Appointments tab. Once created, you can edit its appetite lists ("Can Write" / "Cannot Write"), contact phone details, and commissions right here in coordinates with actual guidelines changes!
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-semibold text-slate-900">How does the dynamic status updating work?</h5>
                    <p className="text-slate-500 leading-relaxed">
                      Our platform syncs active guideline bulletins dynamically. Under the <strong>Submissions & Guidelines Hub</strong>, clicking the refresh button will run an instant check of active JWT auth tokens and portal endpoints, refreshing latency and status indicators in real time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CARRIER WORKSHEETS VIEW */}
          {activeTab === 'worksheets' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/5 p-5 rounded-2xl border border-blue-200/40 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-600 rounded-lg text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-slate-900 text-sm">Carrier-Specific & Supplemental Worksheets</h4>
                    <p className="text-[11px] text-slate-500">Store supplemental applications, risk questionnaires, and rate sheets here</p>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {(editWorksheets.length > 0 ? editWorksheets : (carrier.worksheets || [])).map((ws) => {
                      const isPdf = ws.fileType === 'pdf';
                      const isXlsx = ws.fileType === 'xlsx';
                      const isDoc = ws.fileType === 'docx';
                      return (
                        <div key={ws.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs hover:border-blue-400 transition flex items-start justify-between gap-3 group relative">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-slate-50 text-slate-500 mt-0.5">
                              {isPdf && <FileText className="w-5 h-5 text-red-500" />}
                              {isXlsx && <FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
                              {isDoc && <FileText className="w-5 h-5 text-blue-600" />}
                              {ws.fileType === 'link' && <Link2 className="w-5 h-5 text-indigo-500" />}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="font-sans font-bold text-slate-800 text-xs">{ws.name}</h5>
                                {ws.isRequired && (
                                  <span className="text-[9px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded font-bold font-mono">REQUIRED FOR BIND</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 leading-tight">{ws.description}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-1">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-sans">{ws.lineOfBusiness}</span>
                                <span>•</span>
                                <span>{ws.fileSize}</span>
                                <span>•</span>
                                <span className="uppercase">{ws.fileType}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-center shrink-0">
                            <a
                              href={ws.downloadUrl || "#"}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              onClick={(e) => {
                                e.preventDefault();
                                alert(`💾 Simulated Document Actions: Downloading supplemental sheet "${ws.name}" (${ws.fileSize}, .${ws.fileType}) for carrier "${carrier.name}". Complete this sheet offline and upload it during submission logged leads!`);
                              }}
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-605 text-slate-600 rounded-lg border border-slate-205 transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                              title="Download Supplemental Form"
                            >
                              <Download className="w-3.5 h-3.5 text-blue-600" />
                              <span>Get Form</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}

                    {(editWorksheets.length === 0 && (!carrier.worksheets || carrier.worksheets.length === 0)) && (
                      <div className="md:col-span-2 bg-white/45 p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 italic text-xs">
                        No carrier-specific worksheets or supplemental filings added yet. Enter editing mode above to insert new templates.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {/* Add sheet sub-form */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5 text-xs">
                      <span className="block font-bold text-slate-800 border-b pb-1">Register New Worksheets / Questionnaire Template</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Document Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Roof Inspection Checklist"
                            value={newWorksheetName}
                            onChange={(e) => setNewWorksheetName(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Target Line of Business</label>
                          <input
                            type="text"
                            placeholder="e.g. Commercial Property, Inland Marine"
                            value={newWorksheetLob}
                            onChange={(e) => setNewWorksheetLob(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Brief Description / Guide instructions</label>
                        <input
                          type="text"
                          placeholder="Why is it required? Provide short instructions for completion..."
                          value={newWorksheetDesc}
                          onChange={(e) => setNewWorksheetDesc(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">File Form Type</label>
                          <select
                            value={newWorksheetType}
                            onChange={(e) => setNewWorksheetType(e.target.value as any)}
                            className="w-full p-2 border border-slate-250 rounded bg-white text-slate-700"
                          >
                            <option value="pdf">Acrobat PDF Form (.pdf)</option>
                            <option value="xlsx">Excel rate / schedule calculator (.xlsx)</option>
                            <option value="docx">Word document Questionnaire (.docx)</option>
                            <option value="link">Underwriting Web Portal Link</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">Estimated Size</label>
                          <input
                            type="text"
                            placeholder="e.g. 1.1 MB"
                            value={newWorksheetSize}
                            onChange={(e) => setNewWorksheetSize(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-5">
                          <input
                            type="checkbox"
                            id="ws-req"
                            checked={newWorksheetRequired}
                            onChange={(e) => setNewWorksheetRequired(e.target.checked)}
                            className="w-4 h-4 border-slate-300 rounded cursor-pointer text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="ws-req" className="text-xs font-semibold text-slate-600 cursor-pointer">Required for binding</label>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (!newWorksheetName.trim()) {
                                alert("Please supply a valid worksheet name!");
                                return;
                              }
                              const ws: CarrierWorksheet = {
                                id: `ws-${Date.now()}`,
                                name: newWorksheetName.trim(),
                                description: newWorksheetDesc.trim() || 'Custom agent supplemental sheet uploaded and mapped to account classes.',
                                lineOfBusiness: newWorksheetLob.trim() || 'All LOBs',
                                fileSize: newWorksheetSize || '250 KB',
                                fileType: newWorksheetType,
                                isRequired: newWorksheetRequired,
                                downloadUrl: `https://www.google.com/search?q=${encodeURIComponent(newWorksheetName)}`
                              };
                              setEditWorksheets(prev => [...prev, ws]);
                              setNewWorksheetName('');
                              setNewWorksheetDesc('');
                              setNewWorksheetLob('');
                              setNewWorksheetRequired(false);
                            }}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Form Template
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Array list */}
                    <div className="space-y-2">
                      <span className="block text-[10px] text-slate-400 font-mono uppercase font-bold">Currently Registered Worksheets ({editWorksheets.length})</span>
                      <div className="space-y-2">
                        {editWorksheets.map((ws, idx) => (
                          <div key={ws.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">#{idx + 1}</span>
                              <div>
                                <span className="font-bold text-slate-800">{ws.name}</span>
                                <div className="text-[10px] text-slate-400 font-mono">LOB: {ws.lineOfBusiness} • Required: {ws.isRequired ? 'Yes' : 'No'}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditWorksheets(prev => prev.filter(item => item.id !== ws.id));
                              }}
                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                              title="Delete Worksheet"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions on implementation relative to submissions */}
              <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-md">
                <h4 className="font-sans font-bold text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Info className="w-4 h-4 text-amber-400" />
                  Submission Linking Guidelines
                </h4>

                <div className="space-y-4 text-xs font-sans leading-relaxed">
                  <div className="space-y-1 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                    <p className="text-white font-semibold text-xs">Where do these worksheets apply?</p>
                    <p className="text-slate-400 leading-normal">
                      Supplemental sheets added under a carrier are stored directly inside that carrier's master database record. These forms are instantly accessible to you and your agency brokers on any active device.
                    </p>
                  </div>
                  <div className="space-y-1 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                    <p className="text-white font-semibold text-xs">How to use them during a submission request?</p>
                    <p className="text-slate-400 leading-normal">
                      When mapping a new proposal under the <strong>Submissions & Guidelines Hub</strong>, selecting a carrier that has worksheets defined will automatically render those files as an interactive <strong>"Completable Forms & Sheets Checklist"</strong> right in the submission lead! This ensures no required filings are missed prior to underwriter review.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CNA CLASS CODE LOOKUP VIEW */}
          {activeTab === 'classes' && (
            <CnaClassLookup />
          )}

          {/* AI UNDERWRITING ADVISOR VIEW */}
          {activeTab === 'ai-advisor' && (
            <div className="flex flex-col h-[500px] bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
              {/* Chat Title bar */}
              <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-mono text-slate-400">Carrier Context: {carrier.name}</span>
                </div>
                <button 
                  onClick={() => setMessages([{ role: 'assistant', content: `Refreshed appetite counselor logs for **${carrier.name}**! Ask me anything.` }])}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-mono transition"
                >
                  Clear History
                </button>
              </div>

              {/* Chat Log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-lg p-3 leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none font-semibold' 
                          : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 font-serif'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isAskingAi && (
                  <div className="flex justify-start">
                    <div className="max-w-[50%] bg-slate-800 text-slate-400 rounded-lg rounded-bl-none p-3 border border-slate-700 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Auditing carrier appetite guidelines...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Sample Prompt Chips */}
              <div className="px-3 py-2 bg-slate-950/40 border-t border-slate-800/60 flex flex-wrap gap-1">
                <button 
                  onClick={() => handleSendAiMessage("Does this carrier write restaurant accounts with delivery services?")}
                  className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
                >
                  "Restaurant + delivery?"
                </button>
                <button 
                  onClick={() => handleSendAiMessage("What is the preferred business size in terms of employees and gross revenue?")}
                  className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
                >
                  "Preferred company size?"
                </button>
                <button 
                  onClick={() => handleSendAiMessage("Are artisan contractors required to have safety log histories for licensing?")}
                  className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
                >
                  "Artisan contractor safety?"
                </button>
              </div>

              {/* Input Box */}
              <div className="p-2 bg-slate-950 border-t border-slate-800/80 flex gap-2">
                <input 
                  type="text"
                  placeholder={`Consult AI Advisor about ${carrier.name}'s appetite...`}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                  disabled={isAskingAi}
                  className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <button 
                  onClick={() => handleSendAiMessage()}
                  disabled={isAskingAi || !inputVal.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info lockup */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-between items-center text-[11px] text-slate-400">
          <span>Active Client Submissions: Under audit</span>
          <span>Producer Desk Help: (800) HELP-LINE</span>
        </div>
      </motion.div>
    </div>
  );
}
