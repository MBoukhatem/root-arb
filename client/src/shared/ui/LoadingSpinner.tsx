import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

type LoadingSpinnerProps = {
  size?: number;
  fullscreen?: boolean;
  className?: string;
};

/**
 * Lightweight CSS-only spinner. No animation when prefers-reduced-motion.
 */
export function LoadingSpinner({ size = 24, fullscreen = false, className }: LoadingSpinnerProps) {
  const { t } = useTranslation('common');
  const spinner = (
    <span
      role="status"
      aria-label={t('loading')}
      className={clsx(
        'inline-block animate-spin rounded-full border-2 border-(--border) border-t-(--focus-ring)',
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
  if (!fullscreen) return spinner;
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-(--bg-base)">
      {spinner}
    </div>
  );
}
