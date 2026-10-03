import { Request } from 'express';
import { StaffRole, MembershipTier } from '@prisma/client';

export type UserType = 'member' | 'staff';
export type UserRole = 'member' | 'admin' | 'front_desk' | 'bar' | 'shop';

export interface AuthUser {
  id: number;
  sub?: number;
  email: string;
  type?: UserType;
  role: string; // 'member' | 'admin' | 'front_desk' | 'bar' | 'shop'
  tier?: MembershipTier | string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: any;
  requestId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  error?: ApiErrorPayload;
}
