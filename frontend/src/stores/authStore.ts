import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: Boolean(localStorage.getItem('auth_token')),
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
    set({ token, isAuthenticated: Boolean(token) });
  },
  login: (user, token, refreshToken) => {
    localStorage.setItem('auth_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
