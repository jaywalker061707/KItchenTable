/**
 * Escapes Postgres ILIKE wildcard characters (% _ \) so a value can be
 * used for an exact case-insensitive match without user-typed % or _
 * being read as a wildcard.
 */
export function escapeLikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
