/**
 * Safe typed LocalStorage wrapper with defensive fallback handling.
 */

const TOKEN_KEY = 'health_ai_access_token';

export const storage = {
  getToken(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Storage set error ignored defensively
    }
  },

  removeToken(): void {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Storage remove error ignored defensively
    }
  },

  getRefreshToken(): string | null {
    try {
      const item = window.localStorage.getItem('health_ai_refresh_token');
      if (!item) return null;
      try {
        const parsed = JSON.parse(item);
        return typeof parsed === 'string' ? parsed : item;
      } catch {
        return item;
      }
    } catch {
      return null;
    }
  },

  setRefreshToken(token: string): void {
    try {
      window.localStorage.setItem('health_ai_refresh_token', JSON.stringify(token));
    } catch {
      // Storage set error ignored defensively
    }
  },

  removeRefreshToken(): void {
    try {
      window.localStorage.removeItem('health_ai_refresh_token');
    } catch {
      // Storage remove error ignored defensively
    }
  },

  get<T>(key: string, defaultValue: T): T {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage quota or privacy mode error ignored defensively
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage remove error ignored defensively
    }
  },

  clear(): void {
    try {
      window.localStorage.clear();
    } catch {
      // Storage clear error ignored defensively
    }
  },
};
