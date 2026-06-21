import { describe, expect, it } from "vitest";

import { buildLocaleSitemap, buildSitemapIndex } from "#/lib/content/sitemap";

describe("buildSitemapIndex", () => {
  it("lists a child sitemap for every locale", () => {
    const xml = buildSitemapIndex("https://example.com");

    expect(xml).toContain("<loc>https://example.com/api/sitemap/locale.xml?locale=en</loc>");
    expect(xml).toContain("<loc>https://example.com/api/sitemap/locale.xml?locale=fr</loc>");
  });
});

describe("buildLocaleSitemap", () => {
  it("includes static routes and localized project/blog urls", async () => {
    const xml = await buildLocaleSitemap("https://example.com", "fr");

    expect(xml).toContain("<loc>https://example.com/fr</loc>");
    expect(xml).toContain("<loc>https://example.com/fr/contact</loc>");
    expect(xml).toContain("<loc>https://example.com/fr/blog</loc>");
    expect(xml).toMatch(/<loc>https:\/\/example\.com\/fr\/projects\/[^<]+<\/loc>/);
    expect(xml).toMatch(/<loc>https:\/\/example\.com\/fr\/blog\/[^<]+<\/loc>/);
  });
});

describe("buildLocaleSitemap en", () => {
  it("uses unprefixed urls for the base locale", async () => {
    const xml = await buildLocaleSitemap("https://example.com", "en");

    expect(xml).toContain("<loc>https://example.com/</loc>");
    expect(xml).toContain("<loc>https://example.com/contact</loc>");
    expect(xml).not.toContain("/en/");
  });
});
