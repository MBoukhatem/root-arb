import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/theme/useTheme';

export function ThemeToggle() {
  const { resolved, setMode } = useTheme();
  const { t } = useTranslation(['common']);
  const next = resolved === 'dark' ? 'light' : 'dark';
  return (
    /* Fix #4: Touch target min 44×44 on mobile, 36×36 on md+ */
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={t('common:theme')}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-(--text-secondary) hover:bg-(--bg-card) hover:text-(--text-primary) md:min-h-9 md:min-w-9"
    >
      {resolved === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
