'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'assistant' | 'director';
}

interface AuthContextType {
  user: User | null;
  token: string | null; // For backward compatibility, acts as dummy token if authenticated
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check existing login on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setToken('authenticated_dummy_token');
        }

        // Always check /api/auth/me to verify cookie validity
        const response = await axios.get('/next-api/auth/me');
        if (response.data?.user) {
          setUser(response.data.user);
          setToken('authenticated_dummy_token');
          localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        } else {
          // If no user returned, clear local state
          setUser(null);
          setToken(null);
          localStorage.removeItem('auth_user');
        }
      } catch (err) {
        // Failed auth check → clear local state
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // REAL DATABASE LOGIN via HttpOnly Cookie proxy
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/next-api/auth/login', { email, password }, {
        validateStatus: (status) => status < 500
      });

      if (response.status === 401 || response.status === 422 || response.status === 403) {
        throw new Error(response.data?.message || 'Invalid credentials');
      }

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('An error occurred during login. Please try again.');
      }

      const { user } = response.data;

      setUser(user);
      setToken('authenticated_dummy_token');
      localStorage.setItem('auth_user', JSON.stringify(user));
    } catch (error: any) {
      throw new Error(error instanceof Error ? error.message : 'Invalid credentials');
    }
  };

  // Clear session without API call — used when token is already invalid (401)
  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
  };

  // LOGOUT — calls API then clears session
  const logout = async () => {
    try {
      await axios.post('/next-api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, clearSession, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
