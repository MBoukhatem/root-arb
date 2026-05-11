import axios, { AxiosError, type AxiosInstance } from 'axios';
import { env } from '@/shared/lib/env';

/**
 * Axios instance shared by all features.
 *
 * Auth model (TL R3 #6): JWT 24h Bearer stored in localStorage under
 * `art_at`. We attach it via a request interceptor. On 401 we clear and
 * dispatch a global `auth:logout` event consumed by AuthContext.
 *
 * NOTE: agent_02 R3 originally planned cookie httpOnly + CSRF. TL R3 #6
 * arbitrated Bearer-only; refresh-cookie is NICE P1. Scaffold honours TL.
 */

export const ACCESS_TOKEN_KEY = 'art_at';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or revoked (tokenVersion bumped server-side).
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  },
);

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
};
