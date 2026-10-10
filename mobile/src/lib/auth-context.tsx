import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as api from './api';
import type { OrasageUser } from './api';
import { deleteItem, getItem, setItem } from './storage';

const TOKEN_KEY = 'orasage_token';

type AuthState = {
  /** null = 未登录；undefined = 启动恢复中 */
  user: OrasageUser | null | undefined;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<OrasageUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await getItem(TOKEN_KEY);
      if (!saved) {
        if (!cancelled) setUser(null);
        return;
      }
      try {
        const { user: me } = await api.fetchMe(saved);
        if (!cancelled) {
          setToken(saved);
          setUser(me);
        }
      } catch {
        await deleteItem(TOKEN_KEY);
        if (!cancelled) setUser(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyAuth = useCallback(async (res: api.AuthResponse) => {
    await setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      applyAuth(await api.login(email, password));
    },
    [applyAuth],
  );

  const register = useCallback(
    async (email: string, password: string, nickname?: string) => {
      applyAuth(await api.register(email, password, nickname));
    },
    [applyAuth],
  );

  const logout = useCallback(async () => {
    await deleteItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
