import globalAxios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { Configuration } from '@/sdk';
import { storage } from '@/lib/storage';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiConfig = new Configuration({
  basePath: API_BASE_URL,
  accessToken: () => storage.getToken() ?? '',
});

// Automatic 401 Token Refresh Interceptor
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

globalAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Do not intercept non-401 errors, retried requests, or auth endpoints
    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/verify-otp')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return globalAxios(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = storage.getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      storage.removeToken();
      storage.removeRefreshToken();
      return Promise.reject(error);
    }

    try {
      const response = await globalAxios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data;
      const newAccessToken = data?.accessToken;
      const newRefreshToken = data?.refreshToken;

      if (newAccessToken) {
        storage.setToken(newAccessToken);
        if (newRefreshToken) {
          storage.setRefreshToken(newRefreshToken);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return globalAxios(originalRequest);
      } else {
        throw new Error('No access token returned from refresh');
      }
    } catch (refreshError) {
      processQueue(refreshError, null);
      storage.removeToken();
      storage.removeRefreshToken();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
