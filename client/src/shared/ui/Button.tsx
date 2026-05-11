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
  primary: 'bg-(--cat-verb-fill) text-white hover:opacity-90',
  secondary: 'bg-(--bg-card) text-(--text-primary) border border-(--border) hover:bg-(--border)',
  ghost: 'bg-transparent text-(--text-primary) hover:bg-(--bg-card)',
  destructive: 'bg-(--danger) text-white hover:opacity-90',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
};

/**
 * Shared <Button> per agent_04 R3 §3. Focus-visible ring is supplied by the
 * global `*:focus-visible` rule in globals.css.
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
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed',
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
