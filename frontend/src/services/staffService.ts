import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  StaffMember,
  StaffRole,
  StaffStatus,
  StaffQueryParams,
  CreateStaffPayload,
  UpdateStaffPayload,
  Shift,
  ShiftStatus,
  AssignShiftPayload,
  ClockInOutPayload,
  LeaveRequest,
  LeaveType,
  LeaveStatus,
  CreateLeavePayload,
  ReviewLeavePayload,
} from '@/types/staff';

/**
 * Normalizes backend staff response into frontend StaffMember interface.
 */
export function normalizeStaffMember(s: any): StaffMember {
  if (!s) {
    throw new Error('Invalid staff response');
  }

  const firstName = s.firstName || '';
  const lastName = s.lastName || '';
  const fullName = s.name || `${firstName} ${lastName}`.trim() || 'Staff Member';
  const role: StaffRole = s.role || 'front_desk';
  const status: StaffStatus = s.status || (s.isActive === false ? 'inactive' : 'active');
  const hourlyRatePaise =
    s.hourlyRatePaise ??
    s.salaryPaise ??
    (s.salary !== undefined && s.salary !== null ? Math.round(Number(s.salary) * 100) : 0);
  const joinedDate = s.joinedDate || (s.createdAt ? s.createdAt.split('T')[0] : '');

  return {
    id: String(s.id),
    firstName,
    lastName,
    name: fullName,
    email: s.email || '',
    phone: s.phone || '',
    role,
    status,
    hourlyRatePaise,
    joinedDate,
    notes: s.notes,
    avatarUrl: s.avatarUrl,
  };
}

/**
 * Normalizes backend shift response into frontend Shift interface.
 */
export function normalizeShift(s: any): Shift {
  if (!s) {
    throw new Error('Invalid shift response');
  }

  const dateStr = s.date || (s.shiftDate ? s.shiftDate.split('T')[0] : '');
  const startTime =
    s.startTime ||
    (s.shiftStart ? new Date(s.shiftStart).toISOString().slice(11, 16) : '08:00');
  const endTime =
    s.endTime ||
    (s.shiftEnd ? new Date(s.shiftEnd).toISOString().slice(11, 16) : '17:00');
  const status: ShiftStatus =
    s.status || (!s.shiftEnd ? 'in_progress' : 'completed');

  return {
    id: String(s.id),
    staffId: String(s.staffId),
    staffName:
      s.staffName ||
      (s.staff ? `${s.staff.firstName} ${s.staff.lastName}`.trim() : `Staff #${s.staffId}`),
    role: (s.role || s.staff?.role || 'front_desk') as StaffRole,
    date: dateStr,
    startTime,
    endTime,
    status,
    clockInTime:
      s.clockInTime ||
      (s.shiftStart
        ? new Date(s.shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : undefined),
    clockOutTime:
      s.clockOutTime ||
      (s.shiftEnd
        ? new Date(s.shiftEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : undefined),
    facility: s.facility,
    notes: s.notes || undefined,
  };
}

/**
 * Normalizes backend leave response into frontend LeaveRequest interface.
 */
export function normalizeLeaveRequest(l: any): LeaveRequest {
  if (!l) {
    throw new Error('Invalid leave request response');
  }

  const startDate = l.startDate || (l.fromDate ? l.fromDate.split('T')[0] : '');
  const endDate = l.endDate || (l.toDate ? l.toDate.split('T')[0] : '');
  const daysCount =
    l.daysCount ??
    Math.max(
      1,
      Math.round(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    );

  return {
    id: String(l.id),
    staffId: String(l.staffId),
    staffName:
      l.staffName ||
      (l.staff ? `${l.staff.firstName} ${l.staff.lastName}`.trim() : `Staff #${l.staffId}`),
    role: (l.role || l.staff?.role || 'front_desk') as StaffRole,
    leaveType: (l.leaveType || 'casual') as LeaveType,
    startDate,
    endDate,
    daysCount,
    reason: l.reason || '',
    status: (l.status || 'pending') as LeaveStatus,
    appliedOn: l.appliedOn || (l.createdAt ? l.createdAt.split('T')[0] : ''),
    reviewedBy: l.reviewedBy
      ? String(l.reviewedBy)
      : l.reviewer
      ? `${l.reviewer.firstName} ${l.reviewer.lastName}`.trim()
      : undefined,
    reviewRemarks: l.reviewRemarks || l.remarks || undefined,
  };
}

export const staffService = {
  // ST-01: List staff members with filter & search
  getStaffMembers: async (
    params?: StaffQueryParams
  ): Promise<{ data: StaffMember[]; total: number }> => {
    const cleanParams: Record<string, any> = {
      pageSize: params?.limit || 100,
    };
    if (params?.page) cleanParams.page = params.page;
    if (params?.search && params.search.trim()) cleanParams.search = params.search.trim();
    if (params?.role && params.role !== 'all') cleanParams.role = params.role;
    if (params?.status && params.status !== 'all') {
      cleanParams.isActive = params.status === 'active';
    }

    const response = await apiClient.get<ApiResponse<any[]>>('/staff', {
      params: cleanParams,
    });
    const rawList = response.data?.data || (Array.isArray(response.data) ? response.data : []);
    const normalized = rawList.map(normalizeStaffMember);
    const pagination = (response.data as any)?.pagination;

    return {
      data: normalized,
      total: pagination?.total ?? normalized.length,
    };
  },

  // ST-02: Get staff details by ID
  getStaffById: async (id: string): Promise<StaffMember | null> => {
    const response = await apiClient.get<ApiResponse<any>>(`/staff/${id}`);
    const rawData = response.data?.data || response.data;
    if (!rawData) return null;
    return normalizeStaffMember(rawData);
  },

  // ST-03: Create staff member
  createStaff: async (payload: CreateStaffPayload): Promise<StaffMember> => {
    const cleanPayload = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      password: (payload as any).password || 'Champions@2026',
      role: payload.role,
      phone: payload.phone.trim() || undefined,
      salary: Number(payload.hourlyRatePaise),
    };
    const response = await apiClient.post<ApiResponse<any>>('/staff', cleanPayload);
    const rawData = response.data?.data || response.data;
    return normalizeStaffMember(rawData);
  },

  // ST-04: Update staff member
  updateStaff: async (id: string, payload: UpdateStaffPayload): Promise<StaffMember> => {
    const cleanPayload: Record<string, any> = {};
    if (payload.firstName !== undefined) cleanPayload.firstName = payload.firstName.trim();
    if (payload.lastName !== undefined) cleanPayload.lastName = payload.lastName.trim();
    if (payload.phone !== undefined) cleanPayload.phone = payload.phone.trim();
    if (payload.role !== undefined) cleanPayload.role = payload.role;
    if (payload.hourlyRatePaise !== undefined) {
      cleanPayload.salary = Number(payload.hourlyRatePaise);
    }
    if (payload.status !== undefined) {
      cleanPayload.isActive = payload.status === 'active';
    }
    if ((payload as any).password) {
      cleanPayload.password = (payload as any).password;
    }

    const response = await apiClient.put<ApiResponse<any>>(`/staff/${id}`, cleanPayload);
    const rawData = response.data?.data || response.data;
    return normalizeStaffMember(rawData);
  },

  // SH-01: List shifts (individual staff or club-wide)
  getShifts: async (params?: {
    date?: string;
    staffId?: string;
    role?: string;
  }): Promise<Shift[]> => {
    let rawList: any[] = [];

    if (params?.staffId && params.staffId !== 'all') {
      const response = await apiClient.get<ApiResponse<any[]>>(`/staff/${params.staffId}/shifts`);
      rawList = response.data?.data || (Array.isArray(response.data) ? response.data : []);
    } else {
      const queryParams: Record<string, any> = {};
      if (params?.date) queryParams.date = params.date;
      if (params?.role && params.role !== 'all') queryParams.role = params.role;

      const response = await apiClient.get<ApiResponse<any[]>>('/staff/shifts', {
        params: queryParams,
      });
      rawList = response.data?.data || (Array.isArray(response.data) ? response.data : []);
    }

    return rawList.map(normalizeShift);
  },

  // SH-02: Clock In / Clock Out
  clockInOut: async (payload: ClockInOutPayload): Promise<Shift> => {
    const cleanPayload = {
      shiftId: Number(payload.shiftId),
      action: payload.action,
      timestamp: payload.timestamp,
    };
    const response = await apiClient.post<ApiResponse<any>>('/staff/shifts/clock', cleanPayload);
    const rawData = response.data?.data || response.data;
    return normalizeShift(rawData);
  },

  // Assign / schedule shift
  assignShift: async (payload: AssignShiftPayload): Promise<Shift> => {
    const cleanPayload = {
      staffId: Number(payload.staffId),
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      notes: payload.notes?.trim() || undefined,
    };
    const response = await apiClient.post<ApiResponse<any>>('/staff/shifts', cleanPayload);
    const rawData = response.data?.data || response.data;
    return normalizeShift(rawData);
  },

  // LV-01: List leave requests
  getLeaveRequests: async (params?: {
    status?: string;
    staffId?: string;
  }): Promise<LeaveRequest[]> => {
    let rawList: any[] = [];

    if (params?.staffId && params.staffId !== 'all') {
      const queryParams: Record<string, any> = {};
      if (params.status && params.status !== 'all') queryParams.status = params.status;
      const response = await apiClient.get<ApiResponse<any[]>>(`/staff/${params.staffId}/leave`, {
        params: queryParams,
      });
      rawList = response.data?.data || (Array.isArray(response.data) ? response.data : []);
    } else {
      const queryParams: Record<string, any> = {};
      if (params?.status && params.status !== 'all') queryParams.status = params.status;
      const response = await apiClient.get<ApiResponse<any[]>>('/leave', {
        params: queryParams,
      });
      rawList = response.data?.data || (Array.isArray(response.data) ? response.data : []);
    }

    return rawList.map(normalizeLeaveRequest);
  },

  // LV-02: Submit leave request
  submitLeaveRequest: async (payload: CreateLeavePayload): Promise<LeaveRequest> => {
    const cleanPayload = {
      staffId: Number(payload.staffId),
      startDate: payload.startDate,
      endDate: payload.endDate,
      fromDate: payload.startDate,
      toDate: payload.endDate,
      reason: payload.reason?.trim() || undefined,
      leaveType: payload.leaveType || 'casual',
    };
    const response = await apiClient.post<ApiResponse<any>>('/leave', cleanPayload);
    const rawData = response.data?.data || response.data;
    return normalizeLeaveRequest(rawData);
  },

  // LV-03: Approve / Reject leave
  reviewLeaveRequest: async (payload: ReviewLeavePayload): Promise<LeaveRequest> => {
    const cleanPayload = {
      status: payload.status,
      remarks: payload.remarks || undefined,
    };
    const response = await apiClient.put<ApiResponse<any>>(
      `/leave/${payload.leaveId}`,
      cleanPayload
    );
    const rawData = response.data?.data || response.data;
    return normalizeLeaveRequest(rawData);
  },
};

export default staffService;
