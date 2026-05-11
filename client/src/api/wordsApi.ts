import { axiosInstance, type ApiResponse } from './axiosInstance';
import type { Pagination, Word } from '@/types/models';

export type WordsByRootPayload = {
  words: Word[];
  pagination: Pagination;
};

export const wordsApi = {
  async byRoot(
    rootId: string,
    opts: { page?: number; limit?: number } = {},
  ): Promise<WordsByRootPayload> {
    const { data } = await axiosInstance.get<ApiResponse<WordsByRootPayload>>(
      `/words/by-root/${rootId}`,
      { params: { page: opts.page ?? 1, limit: opts.limit ?? 50 } },
    );
    return data.data;
  },
};
