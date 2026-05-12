import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  collectionsApi,
  type CreateCollectionPayload,
  type UpdateCollectionPayload,
} from '@/api/collectionsApi';
import type { Collection } from '@/types/models';

export const COLLECTIONS_KEY = ['collections'] as const;

export function useCollections() {
  return useQuery({
    queryKey: [...COLLECTIONS_KEY, 'list'],
    queryFn: () => collectionsApi.list(),
    staleTime: 60_000,
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: [...COLLECTIONS_KEY, 'detail', id],
    queryFn: () => collectionsApi.getById(id),
    staleTime: 60_000,
    enabled: Boolean(id),
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

export function useUpdateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: UpdateCollectionPayload }) =>
      collectionsApi.update(vars.id, vars.payload),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: [...COLLECTIONS_KEY, 'list'] });
      const previous = qc.getQueryData<Collection[]>([...COLLECTIONS_KEY, 'list']);
      qc.setQueryData<Collection[]>([...COLLECTIONS_KEY, 'list'], (old) =>
        old ? old.map((c) => (c._id === vars.id ? { ...c, ...vars.payload } : c)) : old,
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData([...COLLECTIONS_KEY, 'list'], ctx.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      void qc.invalidateQueries({ queryKey: [...COLLECTIONS_KEY, 'list'] });
      void qc.invalidateQueries({ queryKey: [...COLLECTIONS_KEY, 'detail', vars.id] });
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
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: [...COLLECTIONS_KEY, 'list'] });
      void qc.invalidateQueries({ queryKey: [...COLLECTIONS_KEY, 'detail', vars.collectionId] });
    },
  });
}

export function useRemoveRootFromCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { collectionId: string; rootId: string }) =>
      collectionsApi.removeRoot(vars.collectionId, vars.rootId),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: [...COLLECTIONS_KEY, 'list'] });
      void qc.invalidateQueries({ queryKey: [...COLLECTIONS_KEY, 'detail', vars.collectionId] });
    },
  });
}

export function useReorderCollectionRoots(collectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rootIds: string[]) => collectionsApi.reorderRoots(collectionId, rootIds),
    onMutate: async (rootIds) => {
      const key = [...COLLECTIONS_KEY, 'detail', collectionId] as const;
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Collection>(key);
      qc.setQueryData<Collection>(key, (old) => (old ? { ...old, roots: rootIds } : old));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData([...COLLECTIONS_KEY, 'detail', collectionId], ctx.previous);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: [...COLLECTIONS_KEY, 'detail', collectionId] });
    },
  });
}
