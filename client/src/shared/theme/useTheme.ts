// Re-export from ThemeContext to keep import paths stable (`@/shared/theme/useTheme`)
// regardless of where the implementation lives.
export { useTheme } from './ThemeContext';
export type { ThemeMode } from './ThemeContext';
