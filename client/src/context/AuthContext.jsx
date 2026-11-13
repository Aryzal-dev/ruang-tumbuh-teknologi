import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('promptvault_user');
    const savedToken = localStorage.getItem('promptvault_token');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify with server in background
        api.getMe()
          .then((res) => {
            setUser(res.user);
            localStorage.setItem('promptvault_user', JSON.stringify(res.user));
          })
          .catch(() => {
            logout();
          })
          .finally(() => setLoading(false));
      } catch (e) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    const handleExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (loginId, password) => {
    const res = await api.login({ login: loginId, password });
    localStorage.setItem('promptvault_token', res.token);
    localStorage.setItem('promptvault_user', JSON.stringify(res.user));
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('promptvault_token');
    localStorage.removeItem('promptvault_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
