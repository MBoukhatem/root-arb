import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, FolderHeart, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCollections, useCreateCollection, useDeleteCollection } from './hooks/useCollections';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

const ICONS = ['📚', '✨', '🌙', '🌿', '🪶', '🕌'];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function CollectionsPage() {
  const { t } = useTranslation(['collections', 'common']);
  const { data, isPending, isError, refetch } = useCollections();
  const create = useCreateCollection();
  const remove = useDeleteCollection();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  function submit() {
    if (!name.trim()) {
      toast.error(t('collections:nameRequired'));
      return;
    }
    create.mutate(
      { name: name.trim(), description: description.trim() || undefined, color, icon },
      {
        onSuccess: () => {
          toast.success(t('collections:collectionCreated'));
          setShowCreate(false);
          setName('');
          setDescription('');
        },
        onError: () => toast.error(t('common:error')),
      },
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-3xl font-bold text-(--text-primary)">{t('collections:title')}</h1>
        <Button icon={<Plus size={16} aria-hidden />} onClick={() => setShowCreate(true)}>
          {t('collections:newCollection')}
        </Button>
      </header>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle size={32} aria-hidden />}
          title={t('common:error')}
          action={<Button onClick={() => void refetch()}>{t('common:retry')}</Button>}
        />
      ) : data && data.length === 0 ? (
        <EmptyState
          icon={<FolderHeart size={32} aria-hidden />}
          title={t('collections:emptyTitle')}
          description={t('collections:emptyDescription')}
          action={
            <Button icon={<Plus size={16} aria-hidden />} onClick={() => setShowCreate(true)}>
              {t('collections:newCollection')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((c) => (
            <article
              key={c._id}
              className="flex flex-col gap-3 rounded-xl border border-(--border) bg-(--bg-card) p-5"
              style={{ borderTopColor: c.color, borderTopWidth: 4 }}
            >
              <header className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>
                    {c.icon ?? '📚'}
                  </span>
                  <h2 className="text-lg font-semibold text-(--text-primary)">{c.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteId(c._id)}
                  aria-label={t('common:delete')}
                  className="rounded-md p-1.5 text-(--text-muted) hover:text-(--danger)"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </header>
              {c.description ? (
                <p className="text-sm text-(--text-muted)">{c.description}</p>
              ) : null}
              <footer className="mt-auto text-xs text-(--text-muted)">
                {t('collections:rootsCount', { count: c.roots.length })}
              </footer>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('collections:newCollection')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              {t('common:cancel')}
            </Button>
            <Button onClick={submit} loading={create.isPending}>
              {t('common:save')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm">{t('collections:nameLabel')}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className="rounded-md border border-(--border) bg-(--bg-card) px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">{t('collections:descriptionLabel')}</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={300}
              className="rounded-md border border-(--border) bg-(--bg-card) px-3 py-2"
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-sm">{t('collections:colorLabel')}</span>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 ${color === c ? 'border-(--text-primary)' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm">{t('collections:iconLabel')}</span>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border ${icon === i ? 'border-(--cat-verb-fill) bg-(--cat-verb-fill)/10' : 'border-(--border) bg-(--bg-card)'}`}
                >
                  <span aria-hidden>{i}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          remove.mutate(deleteId, {
            onSuccess: () => toast.success(t('collections:collectionDeleted')),
            onError: () => toast.error(t('common:error')),
          });
        }}
        title={t('collections:confirmDeleteTitle')}
        message={t('collections:confirmDeleteMessage')}
        tone="destructive"
        confirmLabel={t('common:delete')}
      />
    </section>
  );
}
