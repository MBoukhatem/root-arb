import { use } from 'react';
import { ThemeContext } from './ThemeContext';
export type { ThemeMode } from './ThemeContext';

export function useTheme() {
  const ctx = use(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within <ThemeProvider>');
  }
  return ctx;
}
