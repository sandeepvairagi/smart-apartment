import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider — holds logged-in user + JWT helpers for the whole app.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const skipNextBootstrap = useRef(false);

  // On mount: if we have a token, refresh profile from API
  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }
      if (skipNextBootstrap.current) {
        skipNextBootstrap.current = false;
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const { data } = await authService.getMe();
        if (isMounted) {
          setUser(data.data.user);
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
      } catch {
        if (isMounted) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (email, password) => {
    const { data } = await authService.loginUser({ email, password });
    skipNextBootstrap.current = true;
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setToken(data.data.token);
    setUser(data.data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await authService.registerUser(payload);
    skipNextBootstrap.current = true;
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setToken(data.data.token);
    setUser(data.data.user);
    return data;
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logoutUser();
      }
    } catch {
      // Still clear local session even if API fails
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    setUser,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
