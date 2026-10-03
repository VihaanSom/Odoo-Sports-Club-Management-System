import { apiClient } from './apiClient';
import { mockStaffMembers, mockLeaveRequests } from '@/mock/staff';
import { mockShifts } from '@/mock/shifts';
import type {
  StaffMember,
  StaffQueryParams,
  CreateStaffPayload,
  UpdateStaffPayload,
  Shift,
  AssignShiftPayload,
  ClockInOutPayload,
  LeaveRequest,
  CreateLeavePayload,
  ReviewLeavePayload,
} from '@/types/staff';

let staffStore = [...mockStaffMembers];
let shiftsStore = [...mockShifts];
let leavesStore = [...mockLeaveRequests];

export const staffService = {
  // ST-01: List staff members with filter & search
  getStaffMembers: async (
    params?: StaffQueryParams
  ): Promise<{ data: StaffMember[]; total: number }> => {
    try {
      const response = await apiClient.get<{ data: StaffMember[]; total: number }>('/staff', {
        params,
      });
      return response.data;
    } catch {
      let filtered = [...staffStore];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.firstName.toLowerCase().includes(q) ||
            s.lastName.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.phone.includes(q)
        );
      }
      if (params?.role && params.role !== 'all') {
        filtered = filtered.filter((s) => s.role === params.role);
      }
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter((s) => s.status === params.status);
      }
      return { data: filtered, total: filtered.length };
    }
  },

  // ST-02: Get staff details by ID
  getStaffById: async (id: string): Promise<StaffMember | null> => {
    try {
      const response = await apiClient.get<StaffMember>(`/staff/${id}`);
      return response.data;
    } catch {
      const found = staffStore.find((s) => s.id === id);
      return found || null;
    }
  },

  // ST-03: Create staff member
  createStaff: async (payload: CreateStaffPayload): Promise<StaffMember> => {
    try {
      const response = await apiClient.post<StaffMember>('/staff', payload);
      return response.data;
    } catch {
      const newStaff: StaffMember = {
        ...payload,
        name: `${payload.firstName} ${payload.lastName}`.trim(),
        id: `STF-${String(staffStore.length + 1).padStart(3, '0')}`,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      staffStore.unshift(newStaff);
      return newStaff;
    }
  },

  // ST-04: Update staff member
  updateStaff: async (id: string, payload: UpdateStaffPayload): Promise<StaffMember> => {
    try {
      const response = await apiClient.put<StaffMember>(`/staff/${id}`, payload);
      return response.data;
    } catch {
      const index = staffStore.findIndex((s) => s.id === id);
      if (index === -1) {
        throw new Error('Staff member not found');
      }
      const existing = staffStore[index];
      const firstName = payload.firstName ?? existing.firstName;
      const lastName = payload.lastName ?? existing.lastName;
      staffStore[index] = {
        ...existing,
        ...payload,
        name: `${firstName} ${lastName}`.trim(),
      };
      return staffStore[index];
    }
  },

  // SH-01: List shifts
  getShifts: async (params?: {
    date?: string;
    staffId?: string;
    role?: string;
  }): Promise<Shift[]> => {
    try {
      const response = await apiClient.get<Shift[]>('/staff/shifts', { params });
      return response.data;
    } catch {
      let filtered = [...shiftsStore];
      if (params?.date) {
        filtered = filtered.filter((s) => s.date === params.date);
      }
      if (params?.staffId && params.staffId !== 'all') {
        filtered = filtered.filter((s) => s.staffId === params.staffId);
      }
      if (params?.role && params.role !== 'all') {
        filtered = filtered.filter((s) => s.role === params.role);
      }
      return filtered;
    }
  },

  // SH-02: Clock In / Clock Out
  clockInOut: async (payload: ClockInOutPayload): Promise<Shift> => {
    try {
      const response = await apiClient.post<Shift>('/staff/shifts/clock', payload);
      return response.data;
    } catch {
      const index = shiftsStore.findIndex((s) => s.id === payload.shiftId);
      if (index === -1) {
        throw new Error('Shift not found');
      }
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const shift = shiftsStore[index];

      if (payload.action === 'clock_in') {
        shiftsStore[index] = {
          ...shift,
          status: 'in_progress',
          clockInTime: timeStr,
        };
      } else {
        shiftsStore[index] = {
          ...shift,
          status: 'completed',
          clockOutTime: timeStr,
        };
      }
      return shiftsStore[index];
    }
  },

  // Assign shift (without facility)
  assignShift: async (payload: AssignShiftPayload): Promise<Shift> => {
    try {
      const response = await apiClient.post<Shift>('/staff/shifts', payload);
      return response.data;
    } catch {
      const staff = staffStore.find((s) => s.id === payload.staffId);
      const newShift: Shift = {
        id: `SH-${shiftsStore.length + 201}`,
        staffId: payload.staffId,
        staffName: staff?.name || 'Assigned Staff',
        role: staff?.role || 'front_desk',
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        status: 'scheduled',
        notes: payload.notes,
      };
      shiftsStore.unshift(newShift);
      return newShift;
    }
  },

  // LV-01: List leave requests
  getLeaveRequests: async (params?: {
    status?: string;
    staffId?: string;
  }): Promise<LeaveRequest[]> => {
    try {
      const response = await apiClient.get<LeaveRequest[]>('/staff/leaves', { params });
      return response.data;
    } catch {
      let filtered = [...leavesStore];
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter((l) => l.status === params.status);
      }
      if (params?.staffId && params.staffId !== 'all') {
        filtered = filtered.filter((l) => l.staffId === params.staffId);
      }
      return filtered;
    }
  },

  // LV-02: Submit leave request
  submitLeaveRequest: async (payload: CreateLeavePayload): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.post<LeaveRequest>('/staff/leaves', payload);
      return response.data;
    } catch {
      const staff = staffStore.find((s) => s.id === payload.staffId);
      const start = new Date(payload.startDate);
      const end = new Date(payload.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const newLeave: LeaveRequest = {
        id: `LV-${leavesStore.length + 101}`,
        staffId: payload.staffId,
        staffName: staff?.name || 'Staff Member',
        role: staff?.role || 'front_desk',
        leaveType: payload.leaveType,
        startDate: payload.startDate,
        endDate: payload.endDate,
        daysCount,
        reason: payload.reason,
        status: 'pending',
        appliedOn: new Date().toISOString().split('T')[0],
      };
      leavesStore.unshift(newLeave);
      return newLeave;
    }
  },

  // LV-03: Approve / Reject leave
  reviewLeaveRequest: async (payload: ReviewLeavePayload): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.put<LeaveRequest>(`/staff/leaves/${payload.leaveId}`, payload);
      return response.data;
    } catch {
      const index = leavesStore.findIndex((l) => l.id === payload.leaveId);
      if (index === -1) {
        throw new Error('Leave request not found');
      }
      leavesStore[index] = {
        ...leavesStore[index],
        status: payload.status,
        reviewedBy: 'Rajesh Patel (Admin)',
        reviewRemarks: payload.remarks || `${payload.status === 'approved' ? 'Approved' : 'Rejected'} by management`,
      };
      return leavesStore[index];
    }
  },
};

export default staffService;
