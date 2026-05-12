import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Heart, NotebookPen, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useToggleLike,
  useUpdateNote,
} from './hooks/useNotes';
import { FilterPill } from '@/shared/ui/FilterPill';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Pagination } from '@/shared/ui/Pagination';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { NOTE_TYPES, type Note, type NoteType } from '@/types/models';

const PAGE_SIZE = 10;

const TARGET_TYPES = ['Root', 'Word'] as const;
type TargetType = (typeof TARGET_TYPES)[number];

const VISIBILITY = ['both', 'mine', 'public'] as const;
type Visibility = (typeof VISIBILITY)[number];

export default function NotesPage() {
  const { t } = useTranslation(['notes', 'common']);

  // Filters
  const [type, setType] = useState<NoteType | null>(null);
  const [targetType, setTargetType] = useState<TargetType | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('both');
  const [page, setPage] = useState(1);

  const { data, isPending, isError, refetch } = useNotes({
    type,
    page,
    limit: PAGE_SIZE,
    targetType,
    isPublic: visibility === 'both' ? null : visibility,
  });

  const create = useCreateNote();
  const remove = useDeleteNote();
  const updateNote = useUpdateNote();
  const toggleLike = useToggleLike();

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Edit modal state
  const [editNote, setEditNote] = useState<Note | null>(null);

  // Create form state
  const [formType, setFormType] = useState<NoteType>('general');
  const [content, setContent] = useState('');
  const [targetId, setTargetId] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Edit form state
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState<NoteType>('general');
  const [editIsPublic, setEditIsPublic] = useState(false);

  function openEdit(note: Note) {
    setEditNote(note);
    setEditContent(note.content);
    setEditType(note.type);
    setEditIsPublic(note.isPublic);
  }

  function submitCreate() {
    if (!targetId || content.length === 0) {
      toast.error(t('notes:fillAllFields'));
      return;
    }
    create.mutate(
      {
        targetType: targetType ?? 'Root',
        target: targetId,
        content,
        type: formType,
        isPublic,
      },
      {
        onSuccess: () => {
          toast.success(t('notes:noteCreated'));
          setShowCreate(false);
          setContent('');
          setTargetId('');
          setIsPublic(false);
        },
        onError: () => toast.error(t('common:error')),
      },
    );
  }

  function submitEdit() {
    if (!editNote) return;
    updateNote.mutate(
      {
        id: editNote._id,
        payload: { content: editContent, type: editType, isPublic: editIsPublic },
      },
      {
        onSuccess: () => {
          toast.success(t('notes:noteUpdated'));
          setEditNote(null);
        },
        onError: () => toast.error(t('common:error')),
      },
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-3xl font-bold text-(--text-primary)">{t('notes:title')}</h1>
        <Button icon={<Plus size={16} aria-hidden />} onClick={() => setShowCreate(true)}>
          {t('notes:newNote')}
        </Button>
      </header>

      {/* Filters: type */}
      <div className="flex flex-wrap gap-2">
        <FilterPill active={type === null} onClick={() => setType(null)}>
          {t('notes:allTypes')}
        </FilterPill>
        {NOTE_TYPES.map((n) => (
          <FilterPill key={n} active={type === n} onClick={() => setType(type === n ? null : n)}>
            {t(`notes:type.${n}`)}
          </FilterPill>
        ))}
      </div>

      {/* Filters: targetType */}
      <div className="flex flex-wrap gap-2">
        <FilterPill active={targetType === null} onClick={() => setTargetType(null)}>
          {t('notes:allTargets')}
        </FilterPill>
        {TARGET_TYPES.map((tt) => (
          <FilterPill
            key={tt}
            active={targetType === tt}
            onClick={() => setTargetType(targetType === tt ? null : tt)}
          >
            {t(`notes:targetType.${tt}`)}
          </FilterPill>
        ))}
      </div>

      {/* Filters: visibility */}
      <div className="flex flex-wrap gap-2">
        {VISIBILITY.map((v) => (
          <FilterPill key={v} active={visibility === v} onClick={() => setVisibility(v)}>
            {t(`notes:visibility.${v}`)}
          </FilterPill>
        ))}
      </div>

      {isPending ? (
        <div className="flex flex-col gap-3">
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
      ) : data && data.notes.length === 0 ? (
        <EmptyState
          icon={<NotebookPen size={32} aria-hidden />}
          title={t('notes:emptyTitle')}
          description={t('notes:emptyDescription')}
          action={
            <Button icon={<Plus size={16} aria-hidden />} onClick={() => setShowCreate(true)}>
              {t('notes:newNote')}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {data?.notes.map((n) => (
            <article
              key={n._id}
              className="flex items-start justify-between gap-4 rounded-lg border border-(--border) bg-(--bg-card) p-4"
            >
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-(--text-muted)">
                  <span className="rounded-full bg-(--cat-derive-fill)/10 px-2 py-0.5 text-(--cat-derive-ink)">
                    {t(`notes:type.${n.type}`)}
                  </span>
                  {n.isPublic && (
                    <span className="rounded-full border border-(--border) px-2 py-0.5">
                      {t('notes:public')}
                    </span>
                  )}
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-(--text-primary) whitespace-pre-wrap">{n.content}</p>
                {/* Like button */}
                <button
                  type="button"
                  onClick={() => toggleLike.mutate(n._id)}
                  className="flex items-center gap-1 text-xs text-(--text-muted) hover:text-(--danger) transition-colors w-fit"
                  aria-label={t('notes:like')}
                >
                  <Heart size={14} aria-hidden />
                  <span>{n.likesCount ?? 0}</span>
                </button>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(n)}
                  aria-label={t('common:edit')}
                  className="rounded-md p-2 text-(--text-muted) hover:text-(--text-primary)"
                >
                  <Pencil size={15} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(n._id)}
                  aria-label={t('common:delete')}
                  className="rounded-md p-2 text-(--text-muted) hover:text-(--danger)"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
            </article>
          ))}
          {data ? (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('notes:newNote')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              {t('common:cancel')}
            </Button>
            <Button onClick={submitCreate} loading={create.isPending}>
              {t('common:save')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm">{t('notes:targetTypeLabel')}</span>
            <select
              value={targetType ?? 'Root'}
              onChange={(e) => setTargetType(e.target.value as TargetType)}
              className="rounded-md border border-(--border) bg-(--bg-card) px-3 py-2"
            >
              {TARGET_TYPES.map((tt) => (
                <option key={tt} value={tt}>
                  {t(`notes:targetType.${tt}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">{t('notes:rootId')}</span>
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="rounded-md border border-(--border) bg-(--bg-card) px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">{t('notes:typeLabel')}</span>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as NoteType)}
              className="rounded-md border border-(--border) bg-(--bg-card) px-3 py-2"
            >
              {NOTE_TYPES.map((n) => (
                <option key={n} value={n}>
                  {t(`notes:type.${n}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">{t('notes:contentLabel')}</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              rows={4}
              className="rounded-md border border-(--border) bg-(--bg-card) px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            {t('notes:isPublicLabel')}
          </label>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={Boolean(editNote)}
        onClose={() => setEditNote(null)}
        title={t('notes:editNote')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditNote(null)}>
              {t('common:cancel')}
            </Button>
            <Button onClick={submitEdit} loading={updateNote.isPending}>
              {t('common:save')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm">{t('notes:typeLabel')}</span>
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as NoteType)}
              className="rounded-md border border-(--border) bg-(--bg-card) px-3 py-2"
            >
              {NOTE_TYPES.map((n) => (
                <option key={n} value={n}>
                  {t(`notes:type.${n}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">{t('notes:contentLabel')}</span>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={1000}
              rows={4}
              className="rounded-md border border-(--border) bg-(--bg-card) px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={editIsPublic}
              onChange={(e) => setEditIsPublic(e.target.checked)}
              className="rounded"
            />
            {t('notes:isPublicLabel')}
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          remove.mutate(deleteId, {
            onSuccess: () => toast.success(t('notes:noteDeleted')),
            onError: () => toast.error(t('common:error')),
          });
        }}
        title={t('notes:confirmDeleteTitle')}
        message={t('notes:confirmDeleteMessage')}
        tone="destructive"
        confirmLabel={t('common:delete')}
      />
    </section>
  );
}
