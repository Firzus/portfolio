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
  // Case-study narrative fields. The structure problem → role → stack →
  // decision → outcome → learnings is what best signals seniority for a junior,
  // so it is part of the content schema (issue #13), not just prose convention.
  // The key decision / trade-off behind the project.
  decision: z.string().min(1).optional(),
  // The result, with an optional set of concrete metrics (label + value).
  outcome: z
    .object({
      summary: z.string().min(1),
      metrics: z
        .array(
          z.object({
            label: z.string().min(1),
            value: z.string().min(1),
          }),
        )
        .optional(),
    })
    .optional(),
  // Key takeaways — "what I learned" — as a list of bullet points.
  learnings: z.array(z.string().min(1)).optional(),
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
