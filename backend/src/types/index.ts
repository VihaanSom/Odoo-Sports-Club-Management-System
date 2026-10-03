import { Request } from 'express';
import { MembershipTier } from '@prisma/client';

export type UserRole = 'member' | 'admin' | 'front_desk' | 'bar' | 'shop';

export interface TokenPayload {
  sub: number;
  email: string;
  role: UserRole;
  tier?: MembershipTier | null;
}

export interface AuthUser {
  id: number;
  sub?: number;
  email: string;
  role: UserRole;
  tier?: MembershipTier | null;
  type?: 'member' | 'staff';
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
  code?: string;
  data?: T;
  pagination?: PaginationMeta;
  error?: ApiErrorPayload;
}
