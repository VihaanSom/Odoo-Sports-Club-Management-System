import { apiClient } from './apiClient';
import type { Lead, CreateLeadPayload, UpdateLeadPayload, LeadStatus } from '@/types/leads';

export interface BackendLeadItem {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: LeadStatus;
  assignedTo: number | null;
  assignedStaffName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendLeadsResponse {
  success: boolean;
  data: BackendLeadItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const leadService = {
  // LD-01: List leads with pagination and filters (GET /leads)
  getAll: async (params?: { status?: string; search?: string; page?: number; pageSize?: number }): Promise<Lead[]> => {
    const queryParams: Record<string, any> = {
      page: params?.page || 1,
      pageSize: params?.pageSize || 50,
    };

    if (params?.status && params.status !== 'all' && ['new', 'contacted', 'converted', 'lost'].includes(params.status)) {
      queryParams.status = params.status;
    }

    const response = await apiClient.get<BackendLeadsResponse>('/leads', { params: queryParams });
    const raw: BackendLeadItem[] = (response.data as any).data || response.data || [];

    let leads: Lead[] = raw.map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      message: l.message,
      status: l.status,
      assignedTo: l.assignedTo,
      assignedStaffName: l.assignedStaffName || (l.assignedTo ? `Staff #${l.assignedTo}` : 'Unassigned'),
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    }));

    if (params?.search) {
      const q = params.search.toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.phone && l.phone.includes(q)) ||
          (l.message && l.message.toLowerCase().includes(q))
      );
    }

    return leads;
  },

  // LD-02: Get single lead detail (GET /leads/:id)
  getById: async (id: number | string): Promise<Lead | undefined> => {
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) || id : id;
    const response = await apiClient.get<{ success: boolean; data: BackendLeadItem }>(`/leads/${numericId}`);
    const data: BackendLeadItem = (response.data as any).data || response.data;

    if (!data) return undefined;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      status: data.status,
      assignedTo: data.assignedTo,
      assignedStaffName: data.assignedStaffName || (data.assignedTo ? `Staff #${data.assignedTo}` : 'Unassigned'),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  // LD-03: Update lead status & staff assignment (PATCH /leads/:id)
  updateStatus: async (id: number | string, payload: UpdateLeadPayload): Promise<Lead> => {
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) || id : id;
    const body: Record<string, any> = {};

    if (payload.status !== undefined) {
      body.status = payload.status;
    }
    if (payload.assignedTo !== undefined) {
      body.assignedTo = payload.assignedTo;
    }

    const response = await apiClient.patch<{ success: boolean; data: BackendLeadItem }>(`/leads/${numericId}`, body);
    const data: BackendLeadItem = (response.data as any).data || response.data;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      status: data.status,
      assignedTo: data.assignedTo,
      assignedStaffName: data.assignedStaffName || (data.assignedTo ? `Staff #${data.assignedTo}` : 'Unassigned'),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  // Assign lead to staff (Bug #10): PATCH /leads/:id with { assignedTo: staffId }
  assignLead: async (id: number | string, staffId: number | null): Promise<Lead> => {
    return leadService.updateStatus(id, { assignedTo: staffId });
  },

  // Alias for update
  update: async (id: number | string, payload: UpdateLeadPayload): Promise<Lead> => {
    return leadService.updateStatus(id, payload);
  },

  // CRM Capture: Capture enquiry (POST /public/leads)
  create: async (payload: CreateLeadPayload): Promise<Lead> => {
    const messageParts: string[] = [];
    if (payload.sport) messageParts.push(`[Sport: ${payload.sport}]`);
    if (payload.preferredDate) messageParts.push(`[Preferred Date: ${payload.preferredDate}]`);
    if (payload.preferredTime) messageParts.push(`[Preferred Time: ${payload.preferredTime}]`);
    if (payload.message) messageParts.push(payload.message);

    const body = {
      name: payload.name,
      email: payload.email || undefined,
      phone: payload.phone || undefined,
      message: messageParts.join(' ') || undefined,
    };

    const response = await apiClient.post<{ success: boolean; data: { id: number; message: string } }>('/public/leads', body);
    const resData = (response.data as any).data || response.data;

    return {
      id: resData.id,
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone || null,
      sport: payload.sport || null,
      message: body.message || null,
      status: 'new',
      assignedTo: null,
      assignedStaffName: 'Unassigned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  // Helper: Quick stage transition
  transitionStage: async (id: number | string, newStatus: LeadStatus): Promise<Lead> => {
    return leadService.updateStatus(id, { status: newStatus });
  },
};

export default leadService;
