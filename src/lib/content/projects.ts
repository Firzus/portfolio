import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import { baseLocale, type Locale, resolveLocale } from "#/lib/i18n";

import { type ProjectFrontmatter, projectFrontmatterSchema } from "./schema";

/**
 * Root of the `projects` content tree, structured one directory per locale:
 * `content/projects/{locale}/{slug}.mdx`. The `en` directory is canonical: it
 * defines the set of projects, and any missing localized file falls back to it.
 */
export const DEFAULT_CONTENT_DIR = path.join(process.cwd(), "content", "projects");

const MDX_EXTENSION = ".mdx";

export interface Project {
  slug: string;
  /** The locale that was requested. */
  locale: Locale;
  /** The locale actually served (equals `locale`, or `baseLocale` on fallback). */
  resolvedLocale: Locale;
  frontmatter: ProjectFrontmatter;
  /** Raw MDX body (without frontmatter). Rendering is the caller's concern. */
  body: string;
}

export interface ReadOptions {
  /** Override the content root. Used by tests to point at fixtures. */
  contentDir?: string;
}

/**
 * Thrown when a project's frontmatter fails Zod validation. Carries the slug,
 * locale and flattened issues so the boundary error is actionable.
 */
export class InvalidProjectError extends Error {
  constructor(
    readonly slug: string,
    readonly locale: Locale,
    readonly issues: z.core.$ZodIssue[],
  ) {
    const detail = issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    super(`Invalid frontmatter in project "${slug}" (${locale}): ${detail}`);
    this.name = "InvalidProjectError";
  }
}

function fileFor(contentDir: string, locale: Locale, slug: string): string {
  return path.join(contentDir, locale, `${slug}${MDX_EXTENSION}`);
}

async function readRaw(file: string): Promise<string | null> {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function parse(slug: string, locale: Locale, resolvedLocale: Locale, raw: string): Project {
  const { data, content } = matter(raw);
  const result = projectFrontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new InvalidProjectError(slug, resolvedLocale, result.error.issues);
  }
  return { slug, locale, resolvedLocale, frontmatter: result.data, body: content.trim() };
}

/**
 * Read a single project by slug for a requested locale, falling back to the
 * base locale (`en`) when the localized file is absent. Returns `null` when the
 * project does not exist in any locale. Invalid frontmatter throws
 * `InvalidProjectError`.
 */
export async function readProject(
  slug: string,
  requested: unknown,
  options: ReadOptions = {},
): Promise<Project | null> {
  const contentDir = options.contentDir ?? DEFAULT_CONTENT_DIR;
  const locale = resolveLocale(requested);

  const localized = await readRaw(fileFor(contentDir, locale, slug));
  if (localized !== null) {
    return parse(slug, locale, locale, localized);
  }

  if (locale !== baseLocale) {
    const fallback = await readRaw(fileFor(contentDir, baseLocale, slug));
    if (fallback !== null) {
      return parse(slug, locale, baseLocale, fallback);
    }
  }

  return null;
}

/**
 * Canonical slug set, derived from the base-locale (`en`) directory.
 */
export async function listProjectSlugs(options: ReadOptions = {}): Promise<string[]> {
  const contentDir = options.contentDir ?? DEFAULT_CONTENT_DIR;
  let entries: string[];
  try {
    entries = await readdir(path.join(contentDir, baseLocale));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return entries
    .filter((name) => name.endsWith(MDX_EXTENSION))
    .map((name) => name.slice(0, -MDX_EXTENSION.length))
    .sort();
}

/**
 * Read every project for a requested locale (with per-project locale fallback),
 * sorted by `order` then `title`.
 */
export async function listProjects(
  requested: unknown,
  options: ReadOptions = {},
): Promise<Project[]> {
  const slugs = await listProjectSlugs(options);
  const projects = await Promise.all(slugs.map((slug) => readProject(slug, requested, options)));
  return projects
    .filter((project): project is Project => project !== null)
    .sort((a, b) => {
      const orderA = a.frontmatter.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.frontmatter.order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.frontmatter.title.localeCompare(b.frontmatter.title);
    });
}
