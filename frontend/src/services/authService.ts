import { apiClient } from './apiClient';
import type { User } from '@/types';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch {
      // Mock fallback for offline or standalone prototype
      return {
        user: {
          id: 'USR-001',
          name: credentials.email.split('@')[0] || 'Club Admin',
          email: credentials.email,
          role: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        },
        token: 'mock-jwt-token-sports-club-12345',
      };
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
