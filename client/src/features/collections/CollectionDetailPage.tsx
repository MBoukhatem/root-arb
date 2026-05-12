import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCollection,
  useAddRootToCollection,
  useRemoveRootFromCollection,
} from './hooks/useCollections';
import { SortableRootsList } from './components/SortableRootsList';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { rootsApi } from '@/api/rootsApi';
import { useQuery } from '@tanstack/react-query';

function useAllRoots(search: string) {
  return useQuery({
    queryKey: ['roots', 'picker', search],
    queryFn: () => rootsApi.list({ search: search || undefined, limit: 50 }),
    staleTime: 60_000,
  });
}

function RootPickerModal({
  open,
  onClose,
  collectionId,
  existingRootIds,
}: {
  open: boolean;
  onClose: () => void;
  collectionId: string;
  existingRootIds: string[];
}) {
  const { t } = useTranslation(['collections', 'common']);
  const [search, setSearch] = useState('');
  const { data, isPending } = useAllRoots(search);
  const addRoot = useAddRootToCollection();
  const removeRoot = useRemoveRootFromCollection();

  const existingSet = useMemo(() => new Set(existingRootIds), [existingRootIds]);

  function toggle(rootId: string) {
    if (existingSet.has(rootId)) {
      removeRoot.mutate(
        { collectionId, rootId },
        { onError: () => toast.error(t('common:error')) },
      );
    } else {
      addRoot.mutate({ collectionId, rootId }, { onError: () => toast.error(t('common:error')) });
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('collections:addRoots')}
      footer={
        <Button variant="ghost" onClick={onClose}>
          {t('common:close')}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <input
          type="search"
          placeholder={t('collections:searchRoots')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-(--border) bg-(--bg-card) px-3 py-2 text-sm"
        />
        {isPending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-(--border)" />
            ))}
          </div>
        ) : (
          <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {data?.roots.map((root) => {
              const inCollection = existingSet.has(root._id);
              return (
                <li key={root._id}>
                  <button
                    type="button"
                    onClick={() => toggle(root._id)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      inCollection
                        ? 'bg-(--cat-verb-fill)/10 text-(--cat-verb-ink) font-medium'
                        : 'hover:bg-(--bg-card) text-(--text-primary)'
                    }`}
                  >
                    <span className="font-arabic-title text-base" lang="ar" dir="rtl">
                      {root.letters}
                    </span>
                    <span className="text-(--text-muted) text-xs">{root.transliteration}</span>
                    {inCollection && <X size={14} className="ml-auto shrink-0" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['collections', 'common']);
  const [showPicker, setShowPicker] = useState(false);

  const { data: collection, isPending, isError } = useCollection(id ?? '');

  if (isPending) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </section>
    );
  }

  if (isError || !collection) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <EmptyState
          icon={<AlertCircle size={32} aria-hidden />}
          title={t('common:error')}
          action={<Button onClick={() => navigate(-1)}>{t('common:back')}</Button>}
        />
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md p-2 text-(--text-muted) hover:text-(--text-primary)"
          aria-label={t('common:back')}
        >
          <ArrowLeft size={20} aria-hidden />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-3xl" aria-hidden>
            {collection.icon ?? '📚'}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary)">{collection.name}</h1>
            {collection.description && (
              <p className="text-sm text-(--text-muted)">{collection.description}</p>
            )}
          </div>
        </div>
        <Button icon={<Plus size={16} aria-hidden />} onClick={() => setShowPicker(true)}>
          {t('collections:addRoots')}
        </Button>
      </header>

      {/* Roots list — drag&drop sortable */}
      {collection.roots.length === 0 ? (
        <EmptyState
          icon={<Plus size={32} aria-hidden />}
          title={t('collections:noRootsTitle')}
          description={t('collections:noRootsDescription')}
          action={
            <Button icon={<Plus size={16} aria-hidden />} onClick={() => setShowPicker(true)}>
              {t('collections:addRoots')}
            </Button>
          }
        />
      ) : (
        <SortableRootsList collectionId={collection._id} roots={collection.roots} />
      )}

      <RootPickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        collectionId={collection._id}
        existingRootIds={collection.roots}
      />
    </section>
  );
}
