'use client';

import { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Mock user type
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for a logged-in user in localStorage on component mount
    try {
        const storedUser = localStorage.getItem('apex_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('apex_user');
    }
    setLoading(false);
  }, []);

  const login = useCallback((loggedInUser: User) => {
    localStorage.setItem('apex_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    router.push('/');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('apex_user');
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
  }), [user, loading, login, logout]);

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
