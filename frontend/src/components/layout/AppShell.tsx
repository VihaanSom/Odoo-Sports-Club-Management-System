import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { GlobalLoader } from '@/components/ui/GlobalLoader';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/services/apiClient';
import type { User, ApiResponse } from '@/types';

export const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, token, setUser, logout } = useAuthStore();

  const hasToken = Boolean(token || (typeof window !== 'undefined' && localStorage.getItem('auth_token')));
  const [isVerifying, setIsVerifying] = useState<boolean>(!user && hasToken);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const activeToken = token || localStorage.getItem('auth_token');
      if (!activeToken) {
        if (isMounted) setIsVerifying(false);
        return;
      }

      try {
        // AU-04: GET /api/v1/auth/me
        const response = await apiClient.get<ApiResponse<User>>('/auth/me');
        if (isMounted) {
          const userData = response.data?.data || (response.data as unknown as User);
          if (userData && (userData.id || userData.email)) {
            setUser(userData);
          }
        }
      } catch (err) {
        console.warn('Session verification with /auth/me failed:', err);
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    if (!user && hasToken) {
      verifySession();
    } else {
      setIsVerifying(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user, token, setUser, logout, hasToken]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <GlobalLoader message="Loading your club profile..." fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 pt-0">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <div className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
