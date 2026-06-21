import { z } from "zod";

/**
 * Boundary schema for `posts` (blog) MDX frontmatter. Validation happens at the
 * content-reading seam: any file whose frontmatter does not satisfy this schema
 * is rejected with a clear error rather than surfacing partial/invalid data.
 *
 * Unlike `projects`, `publishedDate` is required: the blog list sorts by it and
 * the RSS feed needs it for `<pubDate>`.
 */
export const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  // ISO date string (YYYY-MM-DD). YAML frontmatter parsers coerce bare dates
  // into JS `Date`s, so normalize those back to a date string before validating.
  publishedDate: z.preprocess(
    (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
    z.iso.date(),
  ),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(false),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
