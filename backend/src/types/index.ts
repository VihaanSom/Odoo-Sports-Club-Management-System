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
  email: string;
  role: UserRole;
  tier?: MembershipTier | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
  errors?: any;
}
