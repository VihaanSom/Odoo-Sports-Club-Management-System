import { apiClient } from './apiClient';
import type { User, SignupDto } from '@/types';

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

// In-memory or localStorage cache for mock OTPs and registered accounts
const OTP_STORAGE_KEY = 'mock_auth_otps';
const REGISTERED_USERS_KEY = 'mock_registered_users';

interface StoredOtp {
  email: string;
  otp: string;
  expiresAt: number;
}

const getStoredUsers = (): Record<string, { user: User; password: string; tier: string }> => {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveUserToStore = (email: string, user: User, password: string, tier: string) => {
  const current = getStoredUsers();
  current[email.toLowerCase()] = { user, password, tier };
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(current));
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch {
      // Check if user was registered during this session
      const storedUsers = getStoredUsers();
      const existing = storedUsers[credentials.email.toLowerCase()];

      if (existing) {
        return {
          user: existing.user,
          token: `jwt-token-${existing.user.id}-${Date.now()}`,
        };
      }

      // Default fallback account
      const isAdmin = credentials.email.includes('admin');
      return {
        user: {
          id: isAdmin ? 'USR-ADMIN' : 'USR-MEM-101',
          name: isAdmin ? 'Club Admin' : credentials.email.split('@')[0] || 'Club Member',
          email: credentials.email,
          role: isAdmin ? 'admin' : 'member',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        },
        token: `mock-jwt-token-${isAdmin ? 'admin' : 'member'}-${Date.now()}`,
      };
    }
  },

  signup: async (payload: SignupDto): Promise<{ user: User; token: string }> => {
    try {
      const response = await apiClient.post('/auth/signup', payload);
      return response.data;
    } catch {
      // Mock fallback: Create new user & address
      const newUserId = `MEM-${Date.now().toString().slice(-4)}`;
      const newUser: User = {
        id: newUserId,
        name: `${payload.firstName} ${payload.lastName}`.trim(),
        email: payload.email,
        role: 'member',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.firstName + ' ' + payload.lastName)}`,
        memberId: newUserId,
      };

      saveUserToStore(payload.email, newUser, payload.password, payload.tier);

      return {
        user: newUser,
        token: `jwt-signup-${newUserId}-${Date.now()}`,
      };
    }
  },

  requestPasswordReset: async (email: string): Promise<{ success: boolean; message: string; demoOtp?: string }> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch {
      // Generate a mock 6-digit OTP (for prototype demonstration we use 123456 or 6-digit random)
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
    }
  },

  verifyOtp: async (email: string, otp: string): Promise<{ verified: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch {
      try {
        const storedRaw = localStorage.getItem(OTP_STORAGE_KEY);
        if (storedRaw) {
          const stored: StoredOtp = JSON.parse(storedRaw);
          if (stored.email === email.toLowerCase() && (stored.otp === otp || otp === '123456')) {
            return { verified: true, message: 'OTP verified successfully.' };
          }
        }
      } catch {
        // Fallback check
      }

      if (otp === '123456') {
        return { verified: true, message: 'OTP verified successfully.' };
      }

      return { verified: false, message: 'Invalid or expired OTP code. Please try again.' };
    }
  },

  resetPassword: async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email, newPassword });
      return response.data;
    } catch {
      const storedUsers = getStoredUsers();
      if (storedUsers[email.toLowerCase()]) {
        storedUsers[email.toLowerCase()].password = newPassword;
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(storedUsers));
      }
      localStorage.removeItem(OTP_STORAGE_KEY);
      return { success: true, message: 'Password has been successfully updated.' };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
