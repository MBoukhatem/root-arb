import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collectionsApi, type CreateCollectionPayload } from '@/api/collectionsApi';

export const COLLECTIONS_KEY = ['collections'] as const;

export function useCollections() {
  return useQuery({
    queryKey: [...COLLECTIONS_KEY, 'list'],
    queryFn: () => collectionsApi.list(),
    staleTime: 60_000,
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCollectionPayload) => collectionsApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...COLLECTIONS_KEY, 'list'] });
    },
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...COLLECTIONS_KEY, 'list'] });
    },
  });
}

export function useAddRootToCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { collectionId: string; rootId: string }) =>
      collectionsApi.addRoot(vars.collectionId, vars.rootId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...COLLECTIONS_KEY, 'list'] });
    },
  });
}
