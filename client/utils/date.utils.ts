/**
 * Formats ISO date string to short date format (e.g. "Aug 3, 2026")
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats ISO date string to detailed date and time format (e.g. "Aug 3, 06:15 PM")
 */
export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
