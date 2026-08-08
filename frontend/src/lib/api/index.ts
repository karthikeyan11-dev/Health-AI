/**
 * API client helpers and interceptor utilities.
 */

export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs: number;
}

export const defaultApiConfig: ApiClientConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeoutMs: 30000,
};
