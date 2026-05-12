import { axiosInstance, type ApiResponse } from './axiosInstance';
import type { CooccurrenceData, LettersListData } from '@/shared/viz/ConcentricLetters/types';

/**
 * Letters API client.
 *
 * Endpoints (delivered by agent_02 / letterController.js):
 *   GET /api/letters                                        → LettersListData
 *   GET /api/letters/:letter/cooccurrences?limit&includeRoots → CooccurrenceData
 */
export const lettersApi = {
  /**
   * Returns all 28+ Arabic letters with their root-count in the dataset.
   */
  async list(): Promise<LettersListData> {
    const { data } = await axiosInstance.get<ApiResponse<LettersListData>>('/letters');
    return data.data;
  },

  /**
   * Returns co-occurrence data for a single Arabic letter.
   * @param letter  — bare Arabic letter (e.g. "ك"). URL-encoded by axios.
   * @param limit   — max neighbours (default 27, cap 28)
   * @param includeRoots — include sharedRootIds in each cooccurrence
   */
  async cooccurrences(letter: string, limit = 27, includeRoots = true): Promise<CooccurrenceData> {
    const { data } = await axiosInstance.get<ApiResponse<CooccurrenceData>>(
      `/letters/${encodeURIComponent(letter)}/cooccurrences`,
      { params: { limit, includeRoots } },
    );
    return data.data;
  },
};
