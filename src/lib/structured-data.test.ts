import { describe, expect, it } from "vitest";

import type { ProjectFrontmatter } from "#/lib/content/schema";
import { siteConfig } from "#/lib/site-config";
import {
  collectionPageJsonLd,
  contactPageJsonLd,
  personJsonLd,
  projectJsonLd,
} from "#/lib/structured-data";

const frontmatter: ProjectFrontmatter = {
  title: "Sample Project",
  summary: "A sample case study.",
  role: "Lead developer",
  stack: ["TypeScript", "React"],
  category: "web",
  featured: true,
  liveUrl: "https://example.com",
  repoUrl: "https://github.com/example/sample",
  publishedDate: "2025-01-15",
};

describe("projectJsonLd", () => {
  it("builds a CreativeWork with author, keywords, genre and dates", () => {
    const jsonLd = projectJsonLd("sample", frontmatter, "en");

    expect(jsonLd).toMatchObject({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: "Sample Project",
      description: "A sample case study.",
      genre: "web",
      keywords: "TypeScript, React",
      datePublished: "2025-01-15",
      author: {
        "@type": "Person",
        name: siteConfig.fullName,
      },
      sameAs: ["https://example.com", "https://github.com/example/sample"],
    });
    // author.url points at the localized home (consistent Person entity).
    expect(projectJsonLd("sample", frontmatter, "en").author.url).toMatch(/\/$/);
  });

  it("localizes the canonical url per locale", () => {
    expect(projectJsonLd("sample", frontmatter, "en").url).toMatch(/\/projects\/sample$/);
    expect(projectJsonLd("sample", frontmatter, "fr").url).toMatch(/\/fr\/projects\/sample$/);
  });

  it("omits optional fields when absent", () => {
    const minimal: ProjectFrontmatter = {
      title: "Minimal",
      summary: "No links or date.",
      role: "Dev",
      stack: ["Go"],
      category: "ai",
      featured: false,
    };
    const jsonLd = projectJsonLd("minimal", minimal, "en");

    expect(jsonLd.datePublished).toBeUndefined();
    expect(jsonLd.sameAs).toBeUndefined();
  });
});

describe("personJsonLd", () => {
  it("includes sameAs and knowsAbout for recruiters", () => {
    const jsonLd = personJsonLd("en");

    expect(jsonLd).toMatchObject({
      "@type": "Person",
      name: siteConfig.fullName,
      sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
    });
    expect(jsonLd.knowsAbout.length).toBeGreaterThan(5);
    expect(jsonLd.knowsAbout).toContain("TypeScript");
  });
});

describe("contactPageJsonLd", () => {
  it("wraps the person as mainEntity", () => {
    const jsonLd = contactPageJsonLd("en", "Contact", "Get in touch");

    expect(jsonLd["@type"]).toBe("ContactPage");
    expect(jsonLd.mainEntity["@type"]).toBe("Person");
    expect(jsonLd.url).toMatch(/\/contact$/);
  });
});

describe("collectionPageJsonLd", () => {
  it("localizes the collection url", () => {
    expect(collectionPageJsonLd("en", "/blog", "Blog", "Posts").url).toMatch(/\/blog$/);
    expect(collectionPageJsonLd("fr", "/blog", "Blog", "Posts").url).toMatch(/\/fr\/blog$/);
  });
});
