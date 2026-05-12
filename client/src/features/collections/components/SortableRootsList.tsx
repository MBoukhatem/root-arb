import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { SortableRootItem, type RootEntry } from './SortableRootItem';
import { useReorderCollectionRoots, useRemoveRootFromCollection } from '../hooks/useCollections';

type Props = {
  collectionId: string;
  /** Raw roots from server — may be populated objects or bare string ids */
  roots: (string | { _id: string; letters?: string; transliteration?: string })[];
};

function toEntries(roots: Props['roots']): RootEntry[] {
  return roots.map((r) =>
    typeof r === 'string'
      ? { id: r }
      : { id: r._id, letters: r.letters, transliteration: r.transliteration },
  );
}

export function SortableRootsList({ collectionId, roots }: Props) {
  const { t } = useTranslation(['common']);
  const [items, setItems] = useState<RootEntry[]>(() => toEntries(roots));

  // Sync when external data changes (e.g. after add/remove)
  const serverEntries = toEntries(roots);
  const serverIds = serverEntries.map((e) => e.id).join(',');
  const localIds = items.map((e) => e.id).join(',');
  if (serverIds !== localIds) {
    setItems(serverEntries);
  }

  const reorder = useReorderCollectionRoots(collectionId);
  const removeRoot = useRemoveRootFromCollection();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setItems((prev) => {
        const oldIndex = prev.findIndex((e) => e.id === active.id);
        const newIndex = prev.findIndex((e) => e.id === over.id);
        const next = arrayMove(prev, oldIndex, newIndex);
        reorder.mutate(
          next.map((e) => e.id),
          { onError: () => toast.error(t('common:error')) },
        );
        return next;
      });
    },
    [reorder, t],
  );

  const handleRemove = useCallback(
    (rootId: string) => {
      removeRoot.mutate(
        { collectionId, rootId },
        { onError: () => toast.error(t('common:error')) },
      );
    },
    [collectionId, removeRoot, t],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={items.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2" aria-label={t('common:sortableList')}>
          {items.map((entry) => (
            <SortableRootItem
              key={entry.id}
              entry={entry}
              collectionId={collectionId}
              onRemove={handleRemove}
              isRemoving={removeRoot.isPending}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
