import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { rootsApi, type RootsQuery } from '@/api/rootsApi';

export const ROOTS_QUERY_KEY = ['roots'] as const;

export function useRoots(query: RootsQuery) {
  return useQuery({
    queryKey: [...ROOTS_QUERY_KEY, 'list', query],
    queryFn: () => rootsApi.list(query),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useRoot(id: string | undefined) {
  return useQuery({
    queryKey: [...ROOTS_QUERY_KEY, 'detail', id],
    queryFn: () => rootsApi.getById(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
