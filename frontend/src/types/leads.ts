export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost';

export interface Lead {
  id: number | string;
  name: string;
  email?: string | null;
  phone?: string | null;
  sport?: string | null;
  message?: string | null;
  status: LeadStatus;
  assignedTo?: number | null;
  assignedStaffName?: string | null;
  createdAt: string;
  updatedAt: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  source?: 'website' | 'walk_in' | 'trial_request' | 'referral';
  notes?: string | null;
}

export interface CreateLeadPayload {
  name: string;
  email?: string;
  phone?: string;
  sport?: string;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
  source?: 'website' | 'walk_in' | 'trial_request' | 'referral';
}

export interface UpdateLeadPayload {
  status: LeadStatus;
  assignedTo?: number | null;
  notes?: string;
}
