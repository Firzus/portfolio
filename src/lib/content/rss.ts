import type { Post } from "./posts";

/** Escape the five XML predefined entities for safe inclusion in text nodes. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Convert an ISO date string (YYYY-MM-DD) to an RFC-822 date for `<pubDate>`. */
function toRfc822(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toUTCString();
}

export interface RssChannel {
  title: string;
  description: string;
  /** Absolute site origin, e.g. `https://portfolio.lprieu.dev`. */
  siteUrl: string;
  /** Absolute URL of the feed itself, used for the atom:self link. */
  feedUrl: string;
  /** Absolute base for post links, e.g. `https://portfolio.lprieu.dev/blog`. */
  blogUrl: string;
}

/**
 * Build an RSS 2.0 feed document from a list of posts. Pure: takes resolved
 * absolute URLs so it has no dependency on the request or i18n runtime.
 */
export function buildRssFeed(channel: RssChannel, posts: Post[]): string {
  const lastBuildDate =
    posts.length > 0 ? toRfc822(posts[0]!.frontmatter.publishedDate) : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const link = `${channel.blogUrl}/${post.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(post.frontmatter.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <description>${escapeXml(post.frontmatter.summary)}</description>`,
        `      <pubDate>${toRfc822(post.frontmatter.publishedDate)}</pubDate>`,
        ...post.frontmatter.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(channel.title)}</title>`,
    `    <link>${escapeXml(channel.siteUrl)}</link>`,
    `    <description>${escapeXml(channel.description)}</description>`,
    `    <atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml" />`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}
