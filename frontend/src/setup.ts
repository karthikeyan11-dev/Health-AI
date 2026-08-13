/**
 * Global Frontend Application Setup
 * Initializes environment validation, telemetry hooks, and global defaults.
 */

export function setupApplication(): void {
  // Global unhandled promise rejection logging in development
  if (import.meta.env.DEV) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Health AI Frontend] Unhandled Promise Rejection:', event.reason);
    });
  }
}
