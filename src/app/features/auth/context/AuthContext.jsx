import { createContext, useContext, useState, useCallback } from "react";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../../../shared/api/apiClient";
import { logout as apiLogout } from "../../../shared/api/authApi";

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function userFromPayload(payload) {
  if (!payload) return null;
  return {
    email: payload.sub || '',
    userId: payload.userId || null,
    nickname: payload.nickname || '',
    provider: payload.provider || 'LOCAL',
    subscriptionLevel: payload.subscriptionLevel || 'FREE',
  };
}

function loadUser() {
  const stored = localStorage.getItem('darfin_user');
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  const token = getAccessToken();
  if (!token) return null;
  return userFromPayload(parseJwt(token));
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadUser());

  const isLoggedIn = !!user;

  const login = useCallback((tokens, userInfo = null) => {
    setTokens(tokens.accessToken, tokens.refreshToken);

    let resolved = userInfo;
    if (!resolved) {
      resolved = userFromPayload(parseJwt(tokens.accessToken));
    }
    localStorage.setItem('darfin_user', JSON.stringify(resolved));
    setUser(resolved);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try { await apiLogout(refreshToken); } catch { /* silent */ }
    }
    clearTokens();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('darfin_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
