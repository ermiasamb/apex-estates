'use client';

import { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, AuthResponse } from '@/services/auth-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (response: AuthResponse) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'apex_access_token';
const REFRESH_TOKEN_KEY = 'apex_refresh_token';
const USER_KEY = 'apex_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for a logged-in user on component mount
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

        if (storedUser && accessToken) {
          // Try to validate the token by fetching current user
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            // Update stored user with fresh data
            localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
          } catch (error) {
            // Token might be expired, try to refresh
            const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (refreshTokenValue) {
              try {
                const newTokens = await authService.refreshToken(refreshTokenValue);
                localStorage.setItem(ACCESS_TOKEN_KEY, newTokens.accessToken);
                localStorage.setItem(REFRESH_TOKEN_KEY, newTokens.refreshToken);
                // Fetch user again with new token
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
                localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
              } catch (refreshError) {
                // Refresh failed, clear everything
                clearAuthData();
              }
            } else {
              clearAuthData();
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        clearAuthData();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const login = useCallback((response: AuthResponse) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setUser(response.user);
    router.push('/');
  }, [router]);

  const logout = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshTokenValue) {
        await authService.logout(refreshTokenValue);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      router.push('/login');
    }
  }, [router]);

  const isAuthenticated = !!user;

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  }), [user, loading, login, logout, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
