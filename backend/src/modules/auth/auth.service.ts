import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
} from '../../utils/token';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { UserRole, TokenPayload } from '../../types';
import { LoginInput } from './auth.schema';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    tier: string | null;
    planId?: number | null;
    status: string;
  };
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  /**
   * AU-01: Unified login checking members table first, then staff table.
   */
  async login(input: LoginInput): Promise<LoginResult> {
    const { email, password } = input;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check members table first
    const member = await prisma.member.findUnique({
      where: { email: normalizedEmail },
    });

    if (member) {
      // Check if membership is expired
      if (member.status === 'expired') {
        throw new ForbiddenError(
          'Your membership has expired. Please contact the front desk.',
          'ACCOUNT_INACTIVE'
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, member.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
      }

      const payload: TokenPayload = {
        sub: member.id,
        email: member.email,
        role: 'member',
        tier: member.tier,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        user: {
          id: member.id,
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          role: 'member',
          tier: member.tier,
          planId: member.planId,
          status: member.status,
        },
      };
    }

    // 2. If not found in members, check staff table
    const staff = await prisma.staff.findUnique({
      where: { email: normalizedEmail },
    });

    if (staff) {
      // Check if staff account is active
      if (!staff.isActive) {
        throw new ForbiddenError(
          'Your staff account is inactive. Please contact the administrator.',
          'ACCOUNT_INACTIVE'
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, staff.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
      }

      const payload: TokenPayload = {
        sub: staff.id,
        email: staff.email,
        role: staff.role as UserRole,
        tier: null,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        user: {
          id: staff.id,
          email: staff.email,
          firstName: staff.firstName,
          lastName: staff.lastName,
          role: staff.role as UserRole,
          tier: null,
          status: staff.isActive ? 'active' : 'inactive',
        },
      };
    }

    // 3. User not found in either table
    throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  /**
   * AU-02: Validate refresh token and issue new rotated tokens.
   */
  async refresh(refreshToken: string): Promise<RefreshResult> {
    let decoded: TokenPayload;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Re-verify that user still exists and remains active in DB
    if (decoded.role === 'member') {
      const member = await prisma.member.findUnique({
        where: { id: decoded.sub },
      });

      if (!member || member.status !== 'active') {
        throw new UnauthorizedError(
          'Member session is no longer active or valid',
          'INVALID_REFRESH_TOKEN'
        );
      }

      const newPayload: TokenPayload = {
        sub: member.id,
        email: member.email,
        role: 'member',
        tier: member.tier,
      };

      return {
        accessToken: generateAccessToken(newPayload),
        refreshToken: generateRefreshToken(newPayload),
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      };
    } else {
      const staff = await prisma.staff.findUnique({
        where: { id: decoded.sub },
      });

      if (!staff || !staff.isActive) {
        throw new UnauthorizedError(
          'Staff session is no longer active or valid',
          'INVALID_REFRESH_TOKEN'
        );
      }

      const newPayload: TokenPayload = {
        sub: staff.id,
        email: staff.email,
        role: staff.role as UserRole,
        tier: null,
      };

      return {
        accessToken: generateAccessToken(newPayload),
        refreshToken: generateRefreshToken(newPayload),
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      };
    }
  }

  /**
   * AU-04: Retrieve current user profile matching contract schema.
   */
  async getMe(userId: number, role: UserRole) {
    if (role === 'member') {
      const member = await prisma.member.findUnique({
        where: { id: userId },
      });

      if (!member) {
        throw new NotFoundError('Member record not found');
      }

      return {
        id: member.id,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: 'member',
        tier: member.tier,
        status: member.status,
        phone: member.phone,
        membershipStart: member.membershipStart,
        membershipEnd: member.membershipEnd,
      };
    } else {
      const staff = await prisma.staff.findUnique({
        where: { id: userId },
      });

      if (!staff) {
        throw new NotFoundError('Staff record not found');
      }

      return {
        id: staff.id,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
        phone: staff.phone,
        salary: staff.salary ? Number(staff.salary) : null,
        isActive: staff.isActive,
      };
    }
  }
}

export const authService = new AuthService();
