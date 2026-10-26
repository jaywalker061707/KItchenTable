/** Returns "YYYY-MM-DD" for "today" in the given IANA timezone. */
export function todayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(
    new Date(),
  );
}

/** Parses a "YYYY-MM-DD" string into a UTC midnight Date (pure calendar date, no timezone drift). */
export function parseISODate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** The most recent Saturday on or before `date` (Sunday=0 ... Saturday=6). */
export function weekAnchor(date: Date): Date {
  const day = date.getUTCDay();
  const offset = (day - 6 + 7) % 7;
  return addDays(date, -offset);
}

export function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
