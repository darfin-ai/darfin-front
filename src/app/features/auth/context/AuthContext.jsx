import { createContext, useContext, useState, useCallback } from "react";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../../../shared/api/apiClient";
import { logout as apiLogout } from "../../../shared/api/authApi";
import { normalizeUserObject } from "../../../shared/lib/userText";

function decodeBase64UrlUtf8(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

function parseJwt(token) {
  try {
    return JSON.parse(decodeBase64UrlUtf8(token.split('.')[1]));
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
  const stored = sessionStorage.getItem('darfin_user');
  if (stored) {
    try {
      const normalized = normalizeUserObject(JSON.parse(stored));
      sessionStorage.setItem('darfin_user', JSON.stringify(normalized));
      return normalized;
    } catch { /* fall through */ }
  }
  const token = getAccessToken();
  if (!token) return null;
  return normalizeUserObject(userFromPayload(parseJwt(token)));
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
    resolved = normalizeUserObject(resolved);
    sessionStorage.setItem('darfin_user', JSON.stringify(resolved));
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
      const next = normalizeUserObject({ ...prev, ...patch });
      sessionStorage.setItem('darfin_user', JSON.stringify(next));
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
