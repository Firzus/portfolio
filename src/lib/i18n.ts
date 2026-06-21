import { z } from "zod";

import { baseLocale, isLocale, type Locale, locales } from "#/paraglide/runtime";

export { baseLocale, type Locale, locales };

/**
 * Locales we actually author editorial content (MDX) in. A subset of the UI
 * `locales` (which are fully translated via the message catalog). Keystatic and
 * any "which locales have content" logic key off this list so we don't expose
 * empty editing surfaces or advertise translations that don't exist. Add a
 * locale here once its `content/{projects,blog}/{locale}` files are authored.
 */
export const contentLocales = ["en", "fr"] as const satisfies readonly Locale[];

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
