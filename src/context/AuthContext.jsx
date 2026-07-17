import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import api from "../apiClient";

const ROLE = "worker";
const STORAGE_PREFIX = "hc_worker_";
const DOMAIN = "@geetauniversity.edu.in";
const AuthContext = createContext(null);

async function loginRequest(email, password) {
  if (typeof email !== "string" || !email.trim().toLowerCase().endsWith(DOMAIN) || !password) {
    throw new Error(`Invalid email or password. Use your ${DOMAIN} email.`);
  }
  return api.login(email.trim().toLowerCase(), password, ROLE);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(`${STORAGE_PREFIX}user`);
    const savedToken = localStorage.getItem(`${STORAGE_PREFIX}token`);
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, rememberMe = true) => {
    const { user: nextUser, token: nextToken } = await loginRequest(email, password);
    setUser(nextUser);
    setToken(nextToken);
    if (rememberMe) {
      localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(nextUser));
      localStorage.setItem(`${STORAGE_PREFIX}token`, nextToken);
    }
    return nextUser;
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...updates };
      if (localStorage.getItem(`${STORAGE_PREFIX}user`)) {
        localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken("");
    localStorage.removeItem(`${STORAGE_PREFIX}user`);
    localStorage.removeItem(`${STORAGE_PREFIX}token`);
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);
  const value = useMemo(
    () => ({ user, token, loading, login, logout, updateProfile, isAuthenticated, role: ROLE }),
    [user, token, loading, login, logout, updateProfile, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
