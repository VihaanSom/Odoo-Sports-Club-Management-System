import { apiClient } from './apiClient';
import type { User, SignupDto } from '@/types';

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

// In-memory or localStorage cache for mock OTPs (used for forgot password flow which has no backend endpoint)
const OTP_STORAGE_KEY = 'mock_auth_otps';

interface StoredOtp {
  email: string;
  otp: string;
  expiresAt: number;
}

export const authService = {
  /**
   * AU-01: Authenticate user (member or staff) against backend API.
   * Returns authenticated user profile and JWT access token.
   */
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    const { accessToken, user } = response.data.data;

    const normalizedUser: User = {
      ...user,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    };

    return {
      user: normalizedUser,
      token: accessToken,
    };
  },

  /**
   * PU-07: Public member self-registration.
   * Registers new member and address in backend and auto-logs in.
   */
  signup: async (payload: SignupDto): Promise<{ user: User; token: string }> => {
    // Determine active planId for the selected tier if not explicitly passed
    let planId = (payload as any).planId;
    if (!planId) {
      try {
        const plansRes = await apiClient.get('/public/plans');
        const tierGroups: Array<{
          tier: string;
          plans: Array<{ id: number; durationMonths: number }>;
        }> = plansRes.data.data;

        const group = tierGroups?.find(
          (g) => g.tier.toLowerCase() === payload.tier.toLowerCase()
        );

        if (group && group.plans && group.plans.length > 0) {
          // Default to 1-month plan if available, or first available plan for tier
          const monthlyPlan = group.plans.find((p) => p.durationMonths === 1);
          planId = monthlyPlan ? monthlyPlan.id : group.plans[0].id;
        }
      } catch {
        // Fallback plan ID if query fails
        planId =
          payload.tier.toLowerCase() === 'junior'
            ? 43
            : payload.tier.toLowerCase() === 'silver'
            ? 40
            : 37;
      }
    }

    const referenceNo =
      payload.paymentMethod === 'card'
        ? `CARD-${Date.now().toString().slice(-6)}`
        : payload.paymentMethod === 'upi'
        ? `UPI-${Date.now().toString().slice(-6)}`
        : null;

    const registerBody = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone || null,
      dateOfBirth: payload.dob || null,
      tier: payload.tier,
      planId: Number(planId) || 1,
      paymentMethod: payload.paymentMethod,
      referenceNo,
      photoUrl: payload.photoUrl || null,
      address: payload.addrLine1
        ? {
            addrLine1: payload.addrLine1,
            addrLine2: payload.addrLine2 || null,
            city: payload.city,
            state: payload.state,
            pincode: payload.pincode,
          }
        : undefined,
    };

    const response = await apiClient.post('/public/register', registerBody);
    const { member, accessToken } = response.data.data;

    const user: User = {
      id: member.id,
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email,
      role: 'member',
      tier: member.tier,
      status: member.status,
      membershipStart: member.membershipStart,
      membershipEnd: member.membershipEnd,
      photoUrl: member.photoUrl,
      avatarUrl: member.photoUrl,
    };

    return {
      user,
      token: accessToken,
    };
  },

  /**
   * Upload profile picture before registration (unauthenticated)
   */
  uploadProfilePicture: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'member');

    const response = await apiClient.post('/uploads/public', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.url;
  },

  /**
   * Client-side prototype simulation for password reset request (no backend endpoint exists in contract)
   */
  requestPasswordReset: async (
    email: string
  ): Promise<{ success: boolean; message: string; demoOtp?: string }> => {
    // Generate a mock 6-digit OTP
    const otp = '123456';
    const stored: StoredOtp = {
      email: email.toLowerCase(),
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(stored));

    return {
      success: true,
      message: 'If an account exists with this email address, we have sent a 6-digit OTP code.',
      demoOtp: otp,
    };
  },

  /**
   * Client-side prototype simulation for OTP verification
   */
  verifyOtp: async (email: string, otp: string): Promise<{ verified: boolean; message: string }> => {
    try {
      const storedRaw = localStorage.getItem(OTP_STORAGE_KEY);
      if (storedRaw) {
        const stored: StoredOtp = JSON.parse(storedRaw);
        if (stored.email === email.toLowerCase() && (stored.otp === otp || otp === '123456')) {
          return { verified: true, message: 'OTP verified successfully.' };
        }
      }
    } catch {
      // Fallback
    }

    if (otp === '123456') {
      return { verified: true, message: 'OTP verified successfully.' };
    }

    return { verified: false, message: 'Invalid or expired OTP code. Please try again.' };
  },

  /**
   * Client-side prototype simulation for password reset completion
   */
  resetPassword: async (
    _email: string,
    _newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    localStorage.removeItem(OTP_STORAGE_KEY);
    return { success: true, message: 'Password has been successfully updated.' };
  },

  /**
   * AU-03: Logout user session and clear refresh token cookie on server.
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', {}, { withCredentials: true });
    } catch {
      // Ignore errors if token/cookie already expired on server
    }
  },

  /**
   * AU-04: Retrieve current authenticated user profile.
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    const user = response.data.data;
    return {
      ...user,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    };
  },
};
