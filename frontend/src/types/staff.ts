export type StaffRole = 'admin' | 'front_desk' | 'bar' | 'shop';

export type StaffStatus = 'active' | 'inactive' | 'on_leave';

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  hourlyRatePaise: number;
  joinedDate: string;
  notes?: string;
  avatarUrl?: string;
}

export type ShiftStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'absent';

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: ShiftStatus;
  clockInTime?: string;
  clockOutTime?: string;
  facility?: string;
  notes?: string;
}

export type LeaveType = 'annual' | 'sick' | 'casual' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewRemarks?: string;
}

export interface StaffQueryParams {
  search?: string;
  role?: StaffRole | 'all';
  status?: StaffStatus | 'all';
  page?: number;
  limit?: number;
}

export interface CreateStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  hourlyRatePaise: number;
  notes?: string;
}

export interface UpdateStaffPayload extends Partial<CreateStaffPayload> {
  status?: StaffStatus;
}

export interface AssignShiftPayload {
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface ClockInOutPayload {
  shiftId: string;
  action: 'clock_in' | 'clock_out';
  timestamp?: string;
}

export interface CreateLeavePayload {
  staffId: string;
  leaveType?: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ReviewLeavePayload {
  leaveId: string;
  status: 'approved' | 'rejected';
  remarks?: string;
}
