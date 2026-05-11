import { axiosInstance, type ApiResponse } from './axiosInstance';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  preferredInterfaceLanguage?: 'fr' | 'en' | 'ar';
  preferredTheme?: 'light' | 'dark' | 'system';
  timezone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
};

export type LoginResponse = {
  user: AuthUser;
  token: string;
};

export const authApi = {
  async register(payload: RegisterPayload): Promise<LoginResponse> {
    const { data } = await axiosInstance.post<ApiResponse<LoginResponse>>(
      '/auth/register',
      payload,
    );
    return data.data;
  },
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', payload);
    return data.data;
  },
  async me(): Promise<AuthUser> {
    const { data } = await axiosInstance.get<ApiResponse<AuthUser>>('/auth/me');
    return data.data;
  },
  async logout(): Promise<void> {
    await axiosInstance.post<ApiResponse<null>>('/auth/logout');
  },
};
