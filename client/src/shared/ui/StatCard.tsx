import { useEffect, useState, type ReactNode } from 'react';
import clsx from 'clsx';

type StatCardProps = {
  icon?: ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  /** Tone influences the icon background tint. */
  tone?: 'verb' | 'noun' | 'adjective' | 'masdar' | 'derive';
  className?: string;
};

const TONE_BG: Record<NonNullable<StatCardProps['tone']>, string> = {
  verb: 'bg-(--cat-verb-fill)/15 text-(--cat-verb-ink)',
  noun: 'bg-(--cat-noun-fill)/15 text-(--cat-noun-ink)',
  adjective: 'bg-(--cat-adjective-fill)/15 text-(--cat-adjective-ink)',
  masdar: 'bg-(--cat-masdar-fill)/15 text-(--cat-masdar-ink)',
  derive: 'bg-(--cat-derive-fill)/15 text-(--cat-derive-ink)',
};

/**
 * Dashboard stat card with simple count-up animation for numeric values.
 * Animation respects prefers-reduced-motion via globals.css (transition off).
 */
export function StatCard({ icon, label, value, suffix, tone = 'verb', className }: StatCardProps) {
  const [display, setDisplay] = useState<number | string>(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const duration = 600;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setDisplay(Math.round(value * eased));
      if (ratio < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div
      className={clsx(
        'flex items-start gap-4 rounded-xl border border-(--border) bg-(--bg-card) p-5',
        className,
      )}
    >
      {icon ? (
        <span className={clsx('rounded-lg p-3', TONE_BG[tone])} aria-hidden>
          {icon}
        </span>
      ) : null}
      <div className="flex flex-col">
        <span className="text-sm text-(--text-muted)">{label}</span>
        <span className="text-2xl font-bold text-(--text-primary)">
          {display}
          {suffix ? <span className="ms-1 text-base text-(--text-muted)">{suffix}</span> : null}
        </span>
      </div>
    </div>
  );
}
