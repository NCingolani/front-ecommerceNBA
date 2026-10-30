import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'token';

function extractRole(payload) {
  const rawRole =
    payload.role ||
    payload.rol ||
    (Array.isArray(payload.roles) && payload.roles[0]) ||
    (Array.isArray(payload.authorities) && (payload.authorities[0]?.authority || payload.authorities[0])) ||
    null;

  if (typeof rawRole === 'string') {
    return rawRole.replace(/^ROLE_/, '');
  }
  return null;
}

function sessionFromToken(token) {
  const [, encodedPayload] = token.split('.');
  if (!encodedPayload) throw new Error('El token recibido no es válido.');

  const base64Payload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
  const normalizedPayload = base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=');
  const payload = JSON.parse(window.atob(normalizedPayload));
  const expiresAt = payload.exp ? payload.exp * 1000 : null;

  if (expiresAt && expiresAt <= Date.now()) {
    throw new Error('La sesión venció. Iniciá sesión nuevamente.');
  }

  return {
    token,
    email: payload.sub || '',
    role: extractRole(payload),
    expiresAt,
  };
}

function getSavedSession() {
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    return sessionFromToken(token);
  } catch {
    window.localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getSavedSession);

  const login = useCallback((token) => {
    const nextSession = sessionFromToken(token);
    window.localStorage.setItem(TOKEN_KEY, token);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    if (!session?.expiresAt) return undefined;

    const timeout = window.setTimeout(logout, Math.max(session.expiresAt - Date.now(), 0));
    return () => window.clearTimeout(timeout);
  }, [session, logout]);

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}