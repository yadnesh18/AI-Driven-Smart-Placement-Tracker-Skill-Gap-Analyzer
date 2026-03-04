import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'auth';
const AuthContext = createContext(null);

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, role: null, user: null };
    return JSON.parse(raw);
  } catch (e) {
    console.warn('failed to parse auth from storage', e);
    return { token: null, role: null, user: null };
  }
}

function writeStored(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('failed to write auth to storage', e);
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // initialize from localStorage once
  useEffect(() => {
    const { token: t, role: r, user: u } = readStored();
    if (t) setToken(t);
    if (r) setRole(r);
    // if storage has an explicit user object use it, otherwise fall back
    if (u) setUser(u);
    else if (r) setUser({ role: r });
  }, []);

  const login = ({ token: t, role: r, user: u }) => {
    setToken(t);
    setRole(r);
    setUser(u || { role: r });
    writeStored({ token: t, role: r, user: u || { role: r } });
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    token,
    role,
    user,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
