/**
 * Safe typed LocalStorage wrapper with defensive fallback handling.
 */

export const storage = {
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
