import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import { baseLocale, type Locale, resolveLocale } from "#/lib/i18n";

import { listRegistryLocales, listRegistrySlugs, readRegistryRaw } from "./registry";
import { type PostFrontmatter, postFrontmatterSchema } from "./post-schema";

/**
 * Root of the `posts` (blog) content tree, structured one directory per locale:
 * `content/blog/{locale}/{slug}.mdx`. The `en` directory is canonical: it
 * defines the set of posts, and any missing localized file falls back to it.
 *
 * In production the build-time `registry` (import.meta.glob) is the source of
 * truth so content is bundled into the serverless function. The fs path is used
 * only when a `contentDir` override is passed (tests).
 */
export const DEFAULT_POSTS_DIR = path.join(process.cwd(), "content", "blog");

const MDX_EXTENSION = ".mdx";

export interface Post {
  slug: string;
  /** The locale that was requested. */
  locale: Locale;
  /** The locale actually served (equals `locale`, or `baseLocale` on fallback). */
  resolvedLocale: Locale;
  /** Locales in which this post has its own file (no fallback). */
  availableLocales: Locale[];
  frontmatter: PostFrontmatter;
  /** Raw MDX body (without frontmatter). Rendering is the caller's concern. */
  body: string;
}

export interface ReadPostOptions {
  /** Override the content root. Used by tests to point at fixtures. */
  contentDir?: string;
  /** Include posts marked `draft: true`. Defaults to false. */
  includeDrafts?: boolean;
}

/**
 * Thrown when a post's frontmatter fails Zod validation. Carries the slug,
 * locale and flattened issues so the boundary error is actionable.
 */
export class InvalidPostError extends Error {
  constructor(
    readonly slug: string,
    readonly locale: Locale,
    readonly issues: z.core.$ZodIssue[],
  ) {
    const detail = issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    super(`Invalid frontmatter in post "${slug}" (${locale}): ${detail}`);
    this.name = "InvalidPostError";
  }
}

function fileFor(contentDir: string, locale: Locale, slug: string): string {
  return path.join(contentDir, locale, `${slug}${MDX_EXTENSION}`);
}

async function readRawFs(file: string): Promise<string | null> {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/** Read raw MDX from the fs override (tests) or the bundled registry (prod). */
async function readRaw(
  contentDir: string | undefined,
  locale: Locale,
  slug: string,
): Promise<string | null> {
  if (contentDir) return readRawFs(fileFor(contentDir, locale, slug));
  return readRegistryRaw("blog", locale, slug);
}

async function listLocaleDirs(contentDir: string): Promise<Locale[]> {
  try {
    const entries = await readdir(contentDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name as Locale);
  } catch {
    return [];
  }
}

/** Locales in which a slug has its own file (registry in prod, fs in tests). */
async function availableLocalesFor(
  contentDir: string | undefined,
  slug: string,
): Promise<Locale[]> {
  if (!contentDir) return listRegistryLocales("blog", slug) as Locale[];
  const present = await Promise.all(
    (await listLocaleDirs(contentDir)).map(async (locale) =>
      (await readRawFs(fileFor(contentDir, locale, slug))) !== null ? locale : null,
    ),
  );
  return present.filter((l): l is Locale => l !== null);
}

function parse(
  slug: string,
  locale: Locale,
  resolvedLocale: Locale,
  availableLocales: Locale[],
  raw: string,
): Post {
  const { data, content } = matter(raw);
  const result = postFrontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new InvalidPostError(slug, resolvedLocale, result.error.issues);
  }
  return {
    slug,
    locale,
    resolvedLocale,
    availableLocales,
    frontmatter: result.data,
    body: content.trim(),
  };
}

/**
 * Read a single post by slug for a requested locale, falling back to the base
 * locale (`en`) when the localized file is absent. Returns `null` when the post
 * does not exist in any locale. Invalid frontmatter throws `InvalidPostError`.
 */
export async function readPost(
  slug: string,
  requested: unknown,
  options: ReadPostOptions = {},
): Promise<Post | null> {
  const { contentDir } = options;
  const locale = resolveLocale(requested);

  const localized = await readRaw(contentDir, locale, slug);
  if (localized !== null) {
    const available = await availableLocalesFor(contentDir, slug);
    return parse(slug, locale, locale, available, localized);
  }

  if (locale !== baseLocale) {
    const fallback = await readRaw(contentDir, baseLocale, slug);
    if (fallback !== null) {
      const available = await availableLocalesFor(contentDir, slug);
      return parse(slug, locale, baseLocale, available, fallback);
    }
  }

  return null;
}

/**
 * Canonical slug set, derived from the base-locale (`en`) directory.
 */
export async function listPostSlugs(options: ReadPostOptions = {}): Promise<string[]> {
  const { contentDir } = options;
  if (!contentDir) return listRegistrySlugs("blog", baseLocale);

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
 * Read every post for a requested locale (with per-post locale fallback),
 * sorted by `publishedDate` descending (newest first), then title. Drafts are
 * excluded unless `includeDrafts` is set.
 */
export async function listPosts(
  requested: unknown,
  options: ReadPostOptions = {},
): Promise<Post[]> {
  const slugs = await listPostSlugs(options);
  const posts = await Promise.all(slugs.map((slug) => readPost(slug, requested, options)));
  return posts
    .filter((post): post is Post => post !== null)
    .filter((post) => options.includeDrafts || !post.frontmatter.draft)
    .sort((a, b) => {
      const dateCompare = b.frontmatter.publishedDate.localeCompare(a.frontmatter.publishedDate);
      if (dateCompare !== 0) return dateCompare;
      return a.frontmatter.title.localeCompare(b.frontmatter.title);
    });
}
