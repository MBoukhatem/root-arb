// @refresh reset
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, type AuthUser, type LoginPayload, type RegisterPayload } from '@/api/authApi';
import { ACCESS_TOKEN_KEY } from '@/api/axiosInstance';

type AuthContextValue = {
  user: AuthUser | null;
  /** True once the bootstrap `/auth/me` call has resolved (success or failure). */
  ready: boolean;
  login: (creds: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  // Bootstrap: if token in LS, hydrate user via /auth/me. Otherwise mark ready.
  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const bootstrap = token
      ? authApi.me().then((u) => {
          if (!cancelled) setUser(u);
        })
      : Promise.resolve();
    bootstrap
      .catch(() => {
        // 401 already handled by axios interceptor (clears token + dispatches
        // auth:logout). For other errors we just remain unauthenticated.
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Listen for global logout events from the axios 401 interceptor.
  useEffect(() => {
    const onForcedLogout = () => {
      setUser(null);
      queryClient.clear();
    };
    window.addEventListener('auth:logout', onForcedLogout);
    return () => {
      window.removeEventListener('auth:logout', onForcedLogout);
    };
  }, [queryClient]);

  const login = useCallback(async (creds: LoginPayload) => {
    const res = await authApi.login(creds);
    localStorage.setItem(ACCESS_TOKEN_KEY, res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    const res = await authApi.register(data);
    localStorage.setItem(ACCESS_TOKEN_KEY, res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort: even if server call fails, clear local state.
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
