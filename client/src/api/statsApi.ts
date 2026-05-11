import { axiosInstance, type ApiResponse } from './axiosInstance';
import type { ConstellationGraph } from '@/types/models';

export const statsApi = {
  async constellation(
    opts: {
      semanticField?: string | null;
      minMastery?: number | null;
    } = {},
  ): Promise<ConstellationGraph> {
    const params: Record<string, string | number> = {};
    if (opts.semanticField) params.semanticField = opts.semanticField;
    if (opts.minMastery != null) params.minMastery = opts.minMastery;
    const { data } = await axiosInstance.get<ApiResponse<ConstellationGraph>>('/constellation', {
      params,
    });
    return data.data;
  },
};
