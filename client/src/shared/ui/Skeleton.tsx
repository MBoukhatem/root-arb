import clsx from 'clsx';

type SkeletonProps = {
  className?: string;
  /** Visual preset: line of text, card block, or D3-tree placeholder. */
  variant?: 'line' | 'card' | 'tree';
};

/**
 * Reusable loading skeleton. Animation is suppressed by globals.css under
 * `prefers-reduced-motion`.
 */
export function Skeleton({ className, variant = 'line' }: SkeletonProps) {
  const base = 'animate-pulse rounded-md bg-(--bg-card)';
  const variantClass =
    variant === 'card' ? 'h-32 w-full' : variant === 'tree' ? 'h-96 w-full' : 'h-4 w-full';
  return <div aria-hidden="true" className={clsx(base, variantClass, className)} />;
}
