import { getLocale } from "#/paraglide/runtime";

/**
 * Format an ISO date string (YYYY-MM-DD) as a localized, human-readable date
 * using the active Paraglide locale. Parsed as UTC to avoid timezone drift on
 * the day boundary.
 */
export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat(getLocale(), {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
