import type { ReactNode } from 'react';
import clsx from 'clsx';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-(--border) bg-(--bg-card) p-10 text-center',
        className,
      )}
    >
      {icon ? <div className="text-(--text-muted)">{icon}</div> : null}
      <h2 className="text-lg font-semibold text-(--text-primary)">{title}</h2>
      {description ? (
        <p className="max-w-prose text-sm text-(--text-muted)">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
