/**
 * Date formatting and timezone parsing utilities.
 */

export function formatDate(date: string | number | Date): string {
  try {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(date);
  }
}

export function formatDateTime(date: string | number | Date): string {
  try {
    const d = new Date(date);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(date);
  }
}

export function getRelativeTimeString(date: string | number | Date): string {
  try {
    const d = new Date(date);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return formatDate(date);
  } catch {
    return String(date);
  }
}
