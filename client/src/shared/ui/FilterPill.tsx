import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type FilterPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  children: ReactNode;
};

/**
 * Toggle pill used for semantic-field / category filters. Active state uses
 * the verb-fill token for consistency with primary buttons.
 */
export function FilterPill({ active = false, className, children, ...rest }: FilterPillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-(--cat-verb-fill) bg-(--cat-verb-fill) text-white'
          : 'border-(--border) bg-(--bg-card) text-(--text-secondary) hover:border-(--cat-verb-fill) hover:text-(--text-primary)',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
