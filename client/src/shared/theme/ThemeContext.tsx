// @refresh reset
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'art_theme';

function readStoredMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'system';
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
}

function getSystemResolved(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode());
  // Track system preference as state so changes trigger re-renders.
  const [systemResolved, setSystemResolved] = useState<ResolvedTheme>(() => getSystemResolved());
  const mqlRef = useRef<MediaQueryList | null>(null);

  // Subscribe to system preference changes.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mqlRef.current = mql;
    const onChange = (e: MediaQueryListEvent) => {
      setSystemResolved(e.matches ? 'dark' : 'light');
    };
    mql.addEventListener('change', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, []);

  // Derive resolved from mode + system — no separate state needed.
  const resolved = useMemo<ResolvedTheme>(
    () => (mode === 'system' ? systemResolved : mode),
    [mode, systemResolved],
  );

  // Apply class to <html> on resolved change.
  useEffect(() => {
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolved]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
