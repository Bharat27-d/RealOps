// Utility to safely handle createdAt and similar date fields
export function toISOStringSafe(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'number') return new Date(date).toISOString();
  return String(date);
}

export function toLocaleStringSafe(date) {
  if (!date) return 'N/A';
  try {
    // Handle Firestore Timestamp objects
    if (date && typeof date === 'object') {
      if (date._seconds !== undefined) {
        return new Date(date._seconds * 1000).toLocaleString();
      }
      if (date.seconds !== undefined) {
        return new Date(date.seconds * 1000).toLocaleString();
      }
      if (date.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleString();
      }
    }
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleString();
  } catch {
    return 'N/A';
  }
}
