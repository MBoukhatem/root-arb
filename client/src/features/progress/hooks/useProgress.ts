import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { progressApi, type RecordReviewPayload } from '@/api/progressApi';
import type { TodayReview } from '@/types/models';

export const PROGRESS_KEY = ['progress'] as const;
const TODAY_KEY = [...PROGRESS_KEY, 'today'] as const;

export function useTodayReview() {
  return useQuery({
    queryKey: TODAY_KEY,
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
    // #10 optimistic update: remove the reviewed root from today's queue immediately
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: TODAY_KEY });
      const previous = qc.getQueryData<TodayReview>(TODAY_KEY);
      qc.setQueryData<TodayReview>(TODAY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          rootsToReview: old.rootsToReview.filter((r) => r.root._id !== payload.rootId),
        };
      });
      return { previous };
    },
    onError: (_err, _payload, context) => {
      // Roll back on error
      if (context?.previous) {
        qc.setQueryData<TodayReview>(TODAY_KEY, context.previous);
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TODAY_KEY });
      void qc.invalidateQueries({ queryKey: [...PROGRESS_KEY, 'stats'] });
    },
  });
}
