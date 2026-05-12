import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { LoadingSpinner } from './LoadingSpinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-(--text-primary) text-(--bg-base) shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-px active:translate-y-0 active:shadow-[var(--shadow-sm)]',
  secondary:
    'bg-(--bg-card) text-(--text-primary) border border-(--border-strong) shadow-[var(--shadow-sm)] hover:bg-(--bg-elev) hover:border-(--gold-accent)',
  ghost: 'bg-transparent text-(--text-primary) hover:bg-(--bg-card)',
  destructive:
    'bg-(--danger) text-white shadow-[var(--shadow-md)] hover:opacity-95 hover:-translate-y-px active:translate-y-0',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-[52px] px-7 text-base tracking-wide',
};

/**
 * Shared <Button> per agent_04 R3 §3 — editorial manuscript style.
 * Primary = ink-on-parchment (deep contrast), secondary = vellum card with
 * gold-on-hover border. Focus-visible ring supplied by globals.css.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium',
        'transition-[transform,box-shadow,background-color,border-color,opacity] duration-200 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[var(--shadow-sm)]',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <LoadingSpinner size={16} /> : icon}
      {children}
    </button>
  );
});
