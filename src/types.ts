export interface Appetite {
  canWrite: string[];
  cannotWrite: string[];
  notes?: string;
  underwritingHotline?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  region?: string;
}

export interface CarrierWorksheet {
  id: string;
  name: string;
  description: string;
  lineOfBusiness: string;
  fileSize: string;
  fileType: 'pdf' | 'xlsx' | 'docx' | 'link';
  isRequired: boolean;
  downloadUrl?: string;
}

export interface Carrier {
  id: string;
  name: string;
  logoUrl?: string; // Standard public URL or custom url
  originalLogoPath?: string; // Sharepoint relative path
  isActive: boolean;
  segment: string[]; // e.g. ["Commercial Lines"]
  linesOfBusiness: string[]; // e.g. ["Business Owners Policy (BOP)", "Work Comp"]
  agencyCode?: string;
  generalAgent?: string;
  website?: string;
  agentLogin?: string;
  appetite: Appetite;
  contacts: Contact[];
  worksheets?: CarrierWorksheet[];
  incentives?: {
    commissionRate?: string;
    levelBonus?: string;
    preferredTier?: string;
    notes?: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  agencyName: string;
  role: string;
  quotaTarget: number;
  avatarBg: string;
}

export type PortalStatusType = 'operational' | 'degraded' | 'down';
export type ResponseTimeType = 'fast' | 'average' | 'slow';

export interface CarrierSystemStatus {
  carrierId: string;
  portalStatus: PortalStatusType;
  responseTime: ResponseTimeType;
  lastChecked: string;
  statusNote?: string;
}

export interface Submission {
  id: string;
  clientName: string;
  carrierId: string;
  lineOfBusiness: string;
  status: 'Draft' | 'Submitted' | 'Underwriting' | 'Approved' | 'Declined' | 'Need Info';
  dateCreated: string;
  dateUpdated: string;
  notes: string;
  amount?: number;
  attachedWorksheetIds?: string[];
}

export interface GuidelineBulletin {
  id: string;
  carrierId?: string; // optional if global bulletin
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  datePosted: string;
  isActive: boolean;
}
