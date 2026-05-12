import { axiosInstance, type ApiResponse } from './axiosInstance';
import type { Note, NoteType, Pagination } from '@/types/models';

export type NotesQuery = {
  page?: number;
  limit?: number;
  type?: NoteType | null;
  targetType?: 'Root' | 'Word' | null;
  isPublic?: 'mine' | 'public' | 'both' | null;
};

export type NotesListPayload = {
  notes: Note[];
  pagination: Pagination;
};

export type CreateNotePayload = {
  targetType: 'Root' | 'Word';
  target: string;
  content: string;
  type: NoteType;
  isPublic?: boolean;
};

export type UpdateNotePayload = {
  content?: string;
  type?: NoteType;
  isPublic?: boolean;
};

function cleanParams(q: NotesQuery): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (q.page) out.page = q.page;
  if (q.limit) out.limit = q.limit;
  if (q.type) out.type = q.type;
  if (q.targetType) out.targetType = q.targetType;
  if (q.isPublic) out.isPublic = q.isPublic;
  return out;
}

export const notesApi = {
  async list(query: NotesQuery = {}): Promise<NotesListPayload> {
    const { data } = await axiosInstance.get<ApiResponse<NotesListPayload>>('/notes', {
      params: cleanParams(query),
    });
    return data.data;
  },
  async create(payload: CreateNotePayload): Promise<Note> {
    const { data } = await axiosInstance.post<ApiResponse<Note>>('/notes', payload);
    return data.data;
  },
  async update(id: string, payload: UpdateNotePayload): Promise<Note> {
    const { data } = await axiosInstance.patch<ApiResponse<Note>>(`/notes/${id}`, payload);
    return data.data;
  },
  async toggleLike(id: string): Promise<Note> {
    const { data } = await axiosInstance.post<ApiResponse<Note>>(`/notes/${id}/like`);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await axiosInstance.delete<ApiResponse<null>>(`/notes/${id}`);
  },
};
