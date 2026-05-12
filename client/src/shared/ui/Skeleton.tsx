import clsx from 'clsx';

type SkeletonProps = {
  className?: string;
  /** Visual preset: line of text, card block, or D3-tree placeholder. */
  variant?: 'line' | 'card' | 'tree';
};

/**
 * Reusable loading skeleton with shimmer effect.
 * Animation is suppressed globally by globals.css `prefers-reduced-motion` reset.
 * Shimmer colours are theme-aware via --skeleton-base / --skeleton-shine tokens.
 */
export function Skeleton({ className, variant = 'line' }: SkeletonProps) {
  const base = 'skeleton-shimmer rounded-md';
  const variantClass =
    variant === 'card' ? 'h-32 w-full' : variant === 'tree' ? 'aspect-square w-full' : 'h-4 w-full';
  return <div aria-hidden="true" className={clsx(base, variantClass, className)} />;
}
