import { useQuery } from '@tanstack/react-query';
import { lettersApi } from '@/api/lettersApi';
import type { CooccurrenceData, LettersListData } from '@/shared/viz/ConcentricLetters/types';

export const LETTERS_QUERY_KEY = ['letters'] as const;

/**
 * Fetches the list of all Arabic letters with their root counts.
 * staleTime 1h — letter inventory changes rarely.
 */
export function useLettersList() {
  return useQuery<LettersListData>({
    queryKey: [...LETTERS_QUERY_KEY, 'list'],
    queryFn: () => lettersApi.list(),
    staleTime: 60 * 60_000,
  });
}

/**
 * Fetches co-occurrence data for a single Arabic letter.
 * staleTime 1h per spec (agent_01 §2).
 */
export function useCooccurrences(letter: string | null) {
  return useQuery<CooccurrenceData>({
    queryKey: [...LETTERS_QUERY_KEY, 'cooccurrences', letter],
    queryFn: () => lettersApi.cooccurrences(letter!, 27, true),
    enabled: Boolean(letter),
    staleTime: 60 * 60_000,
  });
}
