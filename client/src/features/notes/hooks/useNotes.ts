import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesApi, type CreateNotePayload, type NotesQuery } from '@/api/notesApi';

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

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...NOTES_KEY, 'list'] });
    },
  });
}
