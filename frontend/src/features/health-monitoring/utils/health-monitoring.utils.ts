export function formatReadingTime(isoString?: string): string {
  if (!isoString) return 'No reading recorded';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleTimeString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return 'No reading recorded';
  }
}

export function formatValueWithUnit(value?: number | null, unit?: string, fallback = '--'): string {
  if (value === undefined || value === null) {
    return fallback;
  }
  const formattedVal = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return unit ? `${formattedVal} ${unit}` : formattedVal;
}
