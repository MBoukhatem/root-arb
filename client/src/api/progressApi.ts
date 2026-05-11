import { axiosInstance, type ApiResponse } from './axiosInstance';
import type { Progress, ProgressStats, ReviewRating, TodayReview } from '@/types/models';

export type RecordReviewPayload = {
  rootId: string;
  rating: ReviewRating;
};

export const progressApi = {
  async today(): Promise<TodayReview> {
    const { data } = await axiosInstance.get<ApiResponse<TodayReview>>('/progress/today');
    return data.data;
  },
  async stats(): Promise<ProgressStats> {
    const { data } = await axiosInstance.get<ApiResponse<ProgressStats>>('/progress/stats');
    return data.data;
  },
  async record(payload: RecordReviewPayload): Promise<Progress> {
    const { data } = await axiosInstance.post<ApiResponse<Progress>>('/progress', payload);
    return data.data;
  },
};
