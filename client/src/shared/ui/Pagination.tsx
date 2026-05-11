import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { DirectionalIcon } from './DirectionalIcon';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Max number of numeric buttons rendered between prev/next. */
  windowSize?: number;
  className?: string;
};

function buildWindow(page: number, totalPages: number, windowSize: number): number[] {
  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = start + windowSize - 1;
  if (end > totalPages) {
    end = totalPages;
    start = end - windowSize + 1;
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  windowSize = 5,
  className,
}: PaginationProps) {
  const { t } = useTranslation(['common']);

  if (totalPages <= 1) return null;
  const pages = buildWindow(page, totalPages, windowSize);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <nav
      aria-label="pagination"
      className={clsx('flex items-center justify-center gap-1', className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={isFirst}
        className="inline-flex h-9 items-center gap-1 rounded-md border border-(--border) bg-(--bg-card) px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DirectionalIcon name="chevron-prev" size={16} aria-hidden />
        <span>{t('common:previous')}</span>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={clsx(
            'h-9 min-w-9 rounded-md border px-2 text-sm font-medium',
            p === page
              ? 'border-(--cat-verb-fill) bg-(--cat-verb-fill) text-white'
              : 'border-(--border) bg-(--bg-card) text-(--text-secondary) hover:text-(--text-primary)',
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={isLast}
        className="inline-flex h-9 items-center gap-1 rounded-md border border-(--border) bg-(--bg-card) px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{t('common:next')}</span>
        <DirectionalIcon name="chevron-next" size={16} aria-hidden />
      </button>
    </nav>
  );
}
