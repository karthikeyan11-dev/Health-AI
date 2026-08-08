import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const defaultAxiosConfig: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const apiClient: AxiosInstance = axios.create(defaultAxiosConfig);

// Request interceptor to attach JWT token when available
apiClient.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem('health_ai_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for unified response handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);
