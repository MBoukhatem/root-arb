import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  notesApi,
  type CreateNotePayload,
  type NotesQuery,
  type UpdateNotePayload,
} from '@/api/notesApi';
import type { Note } from '@/types/models';
import type { NotesListPayload } from '@/api/notesApi';

export const NOTES_KEY = ['notes'] as const;

export function useNotes(query: NotesQuery = {}) {
  return useQuery({
    queryKey: [...NOTES_KEY, 'list', query],
    queryFn: () => notesApi.list(query),
    staleTime: 30_000,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNotePayload) => notesApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...NOTES_KEY, 'list'] });
    },
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: UpdateNotePayload }) =>
      notesApi.update(vars.id, vars.payload),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: [...NOTES_KEY, 'list'] });
      const previous = qc.getQueriesData<NotesListPayload>({
        queryKey: [...NOTES_KEY, 'list'],
      });
      qc.setQueriesData<NotesListPayload>({ queryKey: [...NOTES_KEY, 'list'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          notes: old.notes.map((n) => (n._id === vars.id ? { ...n, ...vars.payload } : n)),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        for (const [key, value] of ctx.previous) {
          qc.setQueryData(key, value);
        }
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: [...NOTES_KEY, 'list'] });
    },
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.toggleLike(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [...NOTES_KEY, 'list'] });
      const previous = qc.getQueriesData<NotesListPayload>({
        queryKey: [...NOTES_KEY, 'list'],
      });
      qc.setQueriesData<NotesListPayload>({ queryKey: [...NOTES_KEY, 'list'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          notes: old.notes.map((n: Note) =>
            n._id === id ? { ...n, likesCount: (n.likesCount ?? 0) + 1 } : n,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        for (const [key, value] of ctx.previous) {
          qc.setQueryData(key, value);
        }
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: [...NOTES_KEY, 'list'] });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [...NOTES_KEY, 'list'] });
      const previous = qc.getQueriesData<NotesListPayload>({
        queryKey: [...NOTES_KEY, 'list'],
      });
      qc.setQueriesData<NotesListPayload>({ queryKey: [...NOTES_KEY, 'list'] }, (old) => {
        if (!old) return old;
        return { ...old, notes: old.notes.filter((n) => n._id !== id) };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        for (const [key, value] of ctx.previous) {
          qc.setQueryData(key, value);
        }
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: [...NOTES_KEY, 'list'] });
    },
  });
}
