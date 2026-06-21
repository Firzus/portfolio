import { z } from "zod";

/**
 * Project categories mirror the PRD's case-study filters (Web, Desktop, Games, AI).
 */
export const projectCategories = ["web", "desktop", "games", "ai"] as const;
export type ProjectCategory = (typeof projectCategories)[number];

/**
 * Boundary schema for `projects` MDX frontmatter. Validation happens at the
 * content-reading seam: any file whose frontmatter does not satisfy this schema
 * is rejected with a clear error rather than surfacing partial/invalid data.
 */
export const projectFrontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  role: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  category: z.enum(projectCategories),
  featured: z.boolean().default(false),
  order: z.number().int().optional(),
  liveUrl: z.url().optional(),
  repoUrl: z.url().optional(),
  // ISO date string (YYYY-MM-DD). YAML frontmatter parsers coerce bare dates
  // into JS `Date`s, so normalize those back to a date string before validating.
  publishedDate: z
    .preprocess(
      (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
      z.iso.date().optional(),
    )
    .optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
