import { describe, expect, it } from "vitest";

import { baseLocale, locales, resolveLocale } from "#/lib/i18n";

describe("resolveLocale", () => {
  it("returns each supported locale unchanged", () => {
    for (const locale of locales) {
      expect(resolveLocale(locale)).toBe(locale);
    }
  });

  it("normalizes case and surrounding whitespace", () => {
    expect(resolveLocale("FR")).toBe("fr");
    expect(resolveLocale("  de  ")).toBe("de");
  });

  it("falls back to baseLocale for unknown locales", () => {
    expect(resolveLocale("it")).toBe(baseLocale);
    expect(resolveLocale("en-US")).toBe(baseLocale);
    expect(resolveLocale("")).toBe(baseLocale);
  });

  it("falls back to baseLocale for non-string / invalid input", () => {
    expect(resolveLocale(undefined)).toBe(baseLocale);
    expect(resolveLocale(null)).toBe(baseLocale);
    expect(resolveLocale(42)).toBe(baseLocale);
    expect(resolveLocale({})).toBe(baseLocale);
  });

  it("uses 'en' as the base locale", () => {
    expect(baseLocale).toBe("en");
  });
});
