import { axiosInstance, type ApiResponse } from './axiosInstance';
import type { Collection } from '@/types/models';

export type CreateCollectionPayload = {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic?: boolean;
};

export const collectionsApi = {
  async list(): Promise<Collection[]> {
    const { data } =
      await axiosInstance.get<ApiResponse<{ collections: Collection[] }>>('/collections');
    return data.data.collections;
  },
  async getById(id: string): Promise<Collection> {
    const { data } = await axiosInstance.get<ApiResponse<Collection>>(`/collections/${id}`);
    return data.data;
  },
  async create(payload: CreateCollectionPayload): Promise<Collection> {
    const { data } = await axiosInstance.post<ApiResponse<Collection>>('/collections', payload);
    return data.data;
  },
  async addRoot(collectionId: string, rootId: string): Promise<Collection> {
    const { data } = await axiosInstance.post<ApiResponse<Collection>>(
      `/collections/${collectionId}/roots`,
      { rootId },
    );
    return data.data;
  },
  async removeRoot(collectionId: string, rootId: string): Promise<Collection> {
    const { data } = await axiosInstance.delete<ApiResponse<Collection>>(
      `/collections/${collectionId}/roots/${rootId}`,
    );
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await axiosInstance.delete<ApiResponse<null>>(`/collections/${id}`);
  },
};
