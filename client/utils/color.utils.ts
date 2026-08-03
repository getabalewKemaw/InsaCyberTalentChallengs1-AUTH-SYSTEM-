export const CURSOR_COLORS = [
  "#f72585",
  "#7209b7",
  "#3a0ca3",
  "#4361ee",
  "#4cc9f0",
  "#2a9d8f",
  "#e76f51",
  "#f4a261",
  "#e63946",
  "#80b918",
];

/**
 * Deterministically generates a vibrant cursor/avatar color for a given user ID or name.
 */
export function getUserColor(idOrName?: string | null): string {
  if (!idOrName) return CURSOR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}
