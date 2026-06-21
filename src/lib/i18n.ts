import { z } from "zod";

import { baseLocale, isLocale, type Locale, locales } from "#/paraglide/runtime";

export { baseLocale, type Locale, locales };

/**
 * Boundary schema: a requested locale is any string. Anything non-string
 * (undefined, null, numbers, objects) is rejected and falls back to baseLocale.
 */
const requestedLocaleSchema = z.string();

/**
 * Resolve a requested locale to a supported one, falling back to `baseLocale`
 * (en) when the input is missing, malformed, or unsupported.
 *
 * This is the single seam tested for locale resolution + fallback.
 */
export function resolveLocale(requested: unknown): Locale {
  const parsed = requestedLocaleSchema.safeParse(requested);
  if (!parsed.success) return baseLocale;

  const candidate = parsed.data.trim().toLowerCase();
  return isLocale(candidate) ? candidate : baseLocale;
}
