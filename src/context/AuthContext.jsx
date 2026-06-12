import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = 'one8_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((nextUser, accessToken) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  const bootstrapAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/profile');
      persistSession(data, token);
    } catch {
      try {
        const { data } = await api.post('/auth/refresh');
        persistSession(data.user, data.accessToken);
      } catch {
        clearSession();
      }
    } finally {
      setLoading(false);
    }
  }, [clearSession, persistSession]);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persistSession(data.user, data.accessToken);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    persistSession(data.user, data.accessToken);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clear local session even if the server call fails
    } finally {
      clearSession();
    }
  };

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/profile');
    persistSession(data, localStorage.getItem('accessToken'));
    return data;
  }, [persistSession]);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
