// Utility to safely handle createdAt and similar date fields
export function toISOStringSafe(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'number') return new Date(date).toISOString();
  return String(date);
}

export function toLocaleStringSafe(date) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString();
  } catch {
    return String(date);
  }
}
