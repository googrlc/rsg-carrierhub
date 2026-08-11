/**
 * RSG Launchpad — the app's home board of quick links, grouped by section.
 *
 * ── HOW TO ADD A TILE ──────────────────────────────────────────────────────
 * Add an object to LAUNCHPAD_LINKS below. That's it — the Launchpad renders
 * every link, grouped by `section` in the order the sections first appear here.
 *
 *   • External tool  → set `url` (opens in a new tab).
 *   • Internal view  → set `tab` to one of the app's tabs ('panel' | 'global-ai'
 *                      | 'submissions' | 'profile') to jump inside CarrierHub.
 *
 * Sections are just strings; add a new one and it becomes its own group.
 * A later phase can move this list into a Supabase `launchpad_links` table +
 * `/api/launchpad` (same pattern as carriers) so tiles can be added from the
 * browser without a redeploy — the Launchpad component only needs the array.
 * ───────────────────────────────────────────────────────────────────────────
 */

import type { LucideIcon } from 'lucide-react';
import {
  FileText, DollarSign, Globe,
  FolderOpen, Database, Grid3x3, Sparkles, ClipboardList,
  PenTool, UserPlus, DoorOpen, Calculator,
} from 'lucide-react';

export type LaunchpadTab = 'panel' | 'global-ai' | 'submissions' | 'profile';

export interface LaunchpadLink {
  section: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  /** External destination. Omit when this tile jumps to an in-app `tab`. */
  url?: string;
  /** In-app tab to switch to instead of opening a URL. */
  tab?: LaunchpadTab;
}

export const LAUNCHPAD_LINKS: LaunchpadLink[] = [
  // ── Carriers — this app's own carrier surfaces ─────────────────────────────
  { section: 'Carriers', name: 'Carrier Directory', icon: Grid3x3, tab: 'panel',
    desc: 'Appointed carriers — appetite, contacts, agency codes, portal logins.' },
  { section: 'Carriers', name: 'Universal Appetite Index', icon: Sparkles, tab: 'global-ai',
    desc: 'Ask the panel: which carrier fits this risk?' },
  { section: 'Carriers', name: 'Submissions & Guidelines', icon: ClipboardList, tab: 'submissions',
    desc: 'Bind pipeline, bulletins, and carrier guideline library.' },
  { section: 'Carriers', name: 'PayComp', icon: Calculator,
    url: 'https://oht.servehttp.com/agency-app/login/',
    desc: 'Workers’ comp pay-as-you-go payroll processing — agency login.' },
  { section: 'Carriers', name: 'Carrier Files (Nextcloud)', icon: FolderOpen,
    url: 'https://nextcloud-x6wle-u69864.vm.elestio.app/apps/files/?dir=/Carriers',
    desc: 'Agency carrier source folder — appetite kits, UW guides, commissions.' },

  // ── Sales Tools ────────────────────────────────────────────────────────────
  { section: 'Sales Tools', name: 'Client Intake Space', icon: UserPlus,
    url: 'https://lamars-mac-mini.tail1cbc83.ts.net/app',
    desc: 'New-client intake workspace (tailnet).' },
  { section: 'Sales Tools', name: 'Intake Gate', icon: DoorOpen,
    url: 'https://hermes-gretch.tail1cbc83.ts.net/app',
    desc: 'Intake Gate — new-business gate (tailnet).' },
  { section: 'Sales Tools', name: 'NowCerts', icon: FileText,
    url: 'https://www6.nowcerts.com',
    desc: 'AMS system of record. Policies, insureds, certificates.' },
  { section: 'Sales Tools', name: 'Napkin AI', icon: PenTool,
    url: 'https://www.napkin.ai',
    desc: 'Turn text into visuals — diagrams & graphics for proposals.' },
  { section: 'Sales Tools', name: 'Commission Tracker', icon: DollarSign,
    url: 'https://rsg-commission-tracker-339396843209.us-east1.run.app',
    desc: 'Track commissions by carrier, policy, and month.' },
  { section: 'Sales Tools', name: 'RSG Website', icon: Globe,
    url: 'https://www.risksolutionsgroup.com',
    desc: 'Public site — Risk Diagnostic, referral hub, client quick actions.' },

  // ── Storage Tools ──────────────────────────────────────────────────────────
  { section: 'Storage Tools', name: 'Nextcloud', icon: FolderOpen,
    url: 'https://nextcloud-x6wle-u69864.vm.elestio.app',
    desc: 'Shared agency files — client docs (PL / CL) and carrier kits.' },
  { section: 'Storage Tools', name: 'Nextcloud Carriers', icon: FolderOpen,
    url: 'https://nextcloud-x6wle-u69864.vm.elestio.app/apps/files/?dir=/Carriers',
    desc: 'Deep link to /Carriers — same folder as the desktop Nextcloud mount.' },

  // ── Back Office ────────────────────────────────────────────────────────────
  { section: 'Back Office', name: 'Supabase', icon: Database,
    url: 'https://supabase.com/dashboard/project/wibscqhkvpijzqbhjphg',
    desc: 'rsg-infrastructure database & cron jobs.' },
];
