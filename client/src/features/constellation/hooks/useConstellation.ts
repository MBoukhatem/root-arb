import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/statsApi';
import type { SemanticField } from '@/types/models';

export function useConstellation(
  opts: {
    semanticField?: SemanticField | null;
    minMastery?: number | null;
  } = {},
) {
  return useQuery({
    queryKey: ['constellation', opts],
    queryFn: () => statsApi.constellation(opts),
    staleTime: 60_000,
  });
}
