/**
 * Environment helpers and mode checks.
 */

export const env = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  mode: import.meta.env.MODE,
};
