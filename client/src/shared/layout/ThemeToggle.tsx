import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/theme/useTheme';

export function ThemeToggle() {
  const { resolved, setMode } = useTheme();
  const { t } = useTranslation(['common']);
  const next = resolved === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={t('common:theme')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-(--text-secondary) hover:bg-(--bg-card) hover:text-(--text-primary)"
    >
      {resolved === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
