import { describe, expect, it } from "vitest";

import type { Post } from "#/lib/content/posts";
import { buildRssFeed } from "#/lib/content/rss";

function post(overrides: Partial<Post["frontmatter"]> & { slug: string }): Post {
  const { slug, ...frontmatter } = overrides;
  return {
    slug,
    locale: "en",
    resolvedLocale: "en",
    body: "",
    frontmatter: {
      title: "Title",
      summary: "Summary",
      publishedDate: "2025-01-15",
      tags: [],
      draft: false,
      ...frontmatter,
    },
  };
}

const channel = {
  title: "Firzus — Blog",
  description: "Posts.",
  siteUrl: "https://example.com",
  feedUrl: "https://example.com/api/blog/rss.xml",
  blogUrl: "https://example.com/blog",
};

describe("buildRssFeed", () => {
  it("emits a valid RSS 2.0 envelope with self link", () => {
    const xml = buildRssFeed(channel, []);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<title>Firzus — Blog</title>");
    expect(xml).toContain(
      '<atom:link href="https://example.com/api/blog/rss.xml" rel="self" type="application/rss+xml" />',
    );
  });

  it("renders an item per post with absolute link and RFC-822 date", () => {
    const xml = buildRssFeed(channel, [
      post({ slug: "hello", title: "Hello World", publishedDate: "2025-01-15" }),
    ]);
    expect(xml).toContain("<link>https://example.com/blog/hello</link>");
    expect(xml).toContain('<guid isPermaLink="true">https://example.com/blog/hello</guid>');
    expect(xml).toContain("<pubDate>Wed, 15 Jan 2025 00:00:00 GMT</pubDate>");
  });

  it("escapes XML-sensitive characters", () => {
    const xml = buildRssFeed(channel, [
      post({ slug: "x", title: "A & B <tag>", summary: 'Quote "q"' }),
    ]);
    expect(xml).toContain("<title>A &amp; B &lt;tag&gt;</title>");
    expect(xml).toContain("Quote &quot;q&quot;");
    expect(xml).not.toContain("<tag>");
  });

  it("emits a category element per tag", () => {
    const xml = buildRssFeed(channel, [post({ slug: "x", tags: ["ai", "workflow"] })]);
    expect(xml).toContain("<category>ai</category>");
    expect(xml).toContain("<category>workflow</category>");
  });
});
