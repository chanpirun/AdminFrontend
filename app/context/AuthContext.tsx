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
  token: string | null;
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

  // Check existing login on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  // REAL DATABASE LOGIN
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password }, {
        validateStatus: (status) => status < 500 // Prevent axios from throwing on 4xx
      });

      if (response.status === 401 || response.status === 422) {
        throw new Error(response.data?.message || 'Invalid credentials');
      }

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('An error occurred during login. Please try again.');
      }

      const { token, user } = response.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
        throw new Error(
          `Cannot reach API at ${API_URL}. Check backend server status and CORS allowed origins.`
        );
      }
      // Re-throw our custom error or fallback
      throw new Error(error instanceof Error ? error.message : 'Invalid credentials');
    }
  };

  // Clear session without API call — used when token is already invalid (401)
  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  };

  // LOGOUT — calls API then clears session
  const logout = async () => {
    try {
      if (token) {
        await axios.post(
          `${API_URL}/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
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
