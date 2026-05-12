import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export type RootEntry = {
  id: string;
  letters?: string;
  transliteration?: string;
};

type Props = {
  entry: RootEntry;
  collectionId: string;
  onRemove: (rootId: string) => void;
  isRemoving?: boolean;
};

export function SortableRootItem({ entry, onRemove, isRemoving }: Props) {
  const { t } = useTranslation(['common']);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.18)' : undefined,
    scale: isDragging ? '1.02' : undefined,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--bg-card) px-3 py-3"
    >
      {/* Drag handle — keyboard accessible */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none rounded p-1 text-(--text-muted) hover:text-(--text-primary) focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--cat-verb-fill) active:cursor-grabbing"
        aria-label={t('common:dragToReorder')}
        aria-roledescription="sortable"
        tabIndex={0}
      >
        <GripVertical size={16} aria-hidden />
      </button>

      {/* Root content */}
      <Link
        to={`/roots/${encodeURIComponent(entry.id)}`}
        className="flex min-w-0 flex-1 items-center gap-3 hover:underline"
      >
        {entry.letters ? (
          <span className="font-arabic-title text-lg" lang="ar" dir="rtl">
            {entry.letters}
          </span>
        ) : null}
        <span className="truncate text-sm font-medium text-(--text-primary)">
          {entry.transliteration ?? entry.id}
        </span>
      </Link>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        disabled={isRemoving}
        aria-label={t('common:remove')}
        className="shrink-0 rounded-md p-1.5 text-(--text-muted) hover:text-(--danger) disabled:opacity-40"
      >
        <X size={14} aria-hidden />
      </button>
    </li>
  );
}
