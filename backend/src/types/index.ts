import { Request } from 'express';
import { StaffRole, MembershipTier } from '@prisma/client';

export type UserType = 'member' | 'staff';

export interface AuthUser {
  id: number;
  email: string;
  type: UserType;
  role?: StaffRole;
  tier?: MembershipTier;
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
  data?: T;
  errors?: any;
}
