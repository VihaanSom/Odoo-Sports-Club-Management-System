import { apiClient } from './apiClient';
import { mockLeads } from '@/mock/leads';
import type { Lead, CreateLeadPayload, UpdateLeadPayload, LeadStatus } from '@/types/leads';

let localLeads: Lead[] = JSON.parse(JSON.stringify(mockLeads));

export const leadService = {
  // LD-01: List leads with optional status & search filter
  getAll: async (params?: { status?: string; search?: string }): Promise<Lead[]> => {
    try {
      const response = await apiClient.get<Lead[] | { data: Lead[] }>('/leads', { params });
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        return (data as any).data;
      }
      return filterLocalLeads(params);
    } catch {
      return filterLocalLeads(params);
    }
  },

  // LD-02: Get lead detail by ID
  getById: async (id: number | string): Promise<Lead | undefined> => {
    try {
      const response = await apiClient.get<Lead>(`/leads/${id}`);
      return response.data;
    } catch {
      return localLeads.find((l) => String(l.id) === String(id));
    }
  },

  // LD-03: Update lead status and assignment
  updateStatus: async (id: number | string, payload: UpdateLeadPayload): Promise<Lead> => {
    const staffDirectory: Record<number, string> = {
      1: 'Mike Staff (Front Desk)',
      2: 'Elena Vance (Membership)',
      3: 'Carlos Rivera (Head Coach)',
      4: 'Front Desk Team',
    };

    const index = localLeads.findIndex((l) => String(l.id) === String(id));
    let locallyUpdated: Lead | null = null;
    if (index !== -1) {
      const existing = localLeads[index];
      locallyUpdated = {
        ...existing,
        status: payload.status,
        assignedTo: payload.assignedTo !== undefined ? payload.assignedTo : existing.assignedTo,
        assignedStaffName:
          payload.assignedTo !== undefined
            ? payload.assignedTo
              ? staffDirectory[payload.assignedTo] || `Staff #${payload.assignedTo}`
              : 'Unassigned'
            : existing.assignedStaffName,
        notes: payload.notes !== undefined ? payload.notes : existing.notes,
        updatedAt: new Date().toISOString(),
      };
      localLeads[index] = locallyUpdated;
    }

    try {
      const response = await apiClient.put<Lead>(`/leads/${id}`, payload, { timeout: 1500 });
      if (response.data && response.data.id) {
        if (index !== -1) localLeads[index] = response.data;
        return response.data;
      }
      return locallyUpdated || (localLeads[index] as Lead);
    } catch {
      if (locallyUpdated) return locallyUpdated;
      throw new Error('Lead not found');
    }
  },

  // CRM Capture: Capture enquiry / trial booking
  create: async (payload: CreateLeadPayload): Promise<Lead> => {
    try {
      const response = await apiClient.post<Lead>('/public/leads', payload);
      return response.data;
    } catch {
      const nextId = localLeads.length > 0 ? Math.max(...localLeads.map((l) => Number(l.id) || 0)) + 1 : 1;
      const newLead: Lead = {
        id: nextId,
        name: payload.name,
        email: payload.email || null,
        phone: payload.phone || null,
        sport: payload.sport || null,
        message: payload.message || null,
        status: 'new',
        assignedTo: null,
        assignedStaffName: 'Unassigned',
        preferredDate: payload.preferredDate || null,
        preferredTime: payload.preferredTime || null,
        source: payload.source || 'website',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localLeads.unshift(newLead);
      return newLead;
    }
  },

  // Helper: Quick stage transition
  transitionStage: async (id: number | string, newStatus: LeadStatus): Promise<Lead> => {
    return leadService.updateStatus(id, { status: newStatus });
  },
};

function filterLocalLeads(params?: { status?: string; search?: string }): Lead[] {
  let result = [...localLeads];
  if (params?.status && params.status !== 'all') {
    result = result.filter((l) => l.status === params.status);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        (l.sport && l.sport.toLowerCase().includes(q)) ||
        (l.message && l.message.toLowerCase().includes(q))
    );
  }
  return result;
}
