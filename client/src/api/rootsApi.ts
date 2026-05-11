import { axiosInstance, type ApiResponse } from './axiosInstance';
import type { PaginatedResult, Root, SemanticField, Word } from '@/types/models';

export type RootsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  semanticField?: SemanticField | null;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  isEssential?: boolean | null;
  isQuranic?: boolean | null;
};

export type RootsListPayload = {
  roots: Root[];
  pagination: PaginatedResult<Root>['pagination'];
};

export type RootDetailPayload = {
  root: Root;
  words: Word[];
};

function cleanParams(input: RootsQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (input.page) params.page = input.page;
  if (input.limit) params.limit = input.limit;
  if (input.search && input.search.length > 0) params.search = input.search;
  if (input.semanticField) params.semanticField = input.semanticField;
  if (input.difficulty) params.difficulty = input.difficulty;
  if (input.isEssential != null) params.isEssential = String(input.isEssential);
  if (input.isQuranic != null) params.isQuranic = String(input.isQuranic);
  return params;
}

export const rootsApi = {
  async list(query: RootsQuery): Promise<RootsListPayload> {
    const { data } = await axiosInstance.get<ApiResponse<RootsListPayload>>('/roots', {
      params: cleanParams(query),
    });
    return data.data;
  },
  async getById(id: string): Promise<RootDetailPayload> {
    const { data } = await axiosInstance.get<ApiResponse<RootDetailPayload>>(`/roots/${id}`);
    return data.data;
  },
};
