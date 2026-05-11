import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { progressApi, type RecordReviewPayload } from '@/api/progressApi';

export const PROGRESS_KEY = ['progress'] as const;

export function useTodayReview() {
  return useQuery({
    queryKey: [...PROGRESS_KEY, 'today'],
    queryFn: () => progressApi.today(),
    staleTime: 30_000,
  });
}

export function useProgressStats() {
  return useQuery({
    queryKey: [...PROGRESS_KEY, 'stats'],
    queryFn: () => progressApi.stats(),
    staleTime: 60_000,
  });
}

export function useRecordReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordReviewPayload) => progressApi.record(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...PROGRESS_KEY, 'today'] });
      void qc.invalidateQueries({ queryKey: [...PROGRESS_KEY, 'stats'] });
    },
  });
}
