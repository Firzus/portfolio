import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import { baseLocale, type Locale, resolveLocale } from "#/lib/i18n";

import { type PostFrontmatter, postFrontmatterSchema } from "./post-schema";

/**
 * Root of the `posts` (blog) content tree, structured one directory per locale:
 * `content/blog/{locale}/{slug}.mdx`. The `en` directory is canonical: it
 * defines the set of posts, and any missing localized file falls back to it.
 */
export const DEFAULT_POSTS_DIR = path.join(process.cwd(), "content", "blog");

const MDX_EXTENSION = ".mdx";

export interface Post {
  slug: string;
  /** The locale that was requested. */
  locale: Locale;
  /** The locale actually served (equals `locale`, or `baseLocale` on fallback). */
  resolvedLocale: Locale;
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

async function readRaw(file: string): Promise<string | null> {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function parse(slug: string, locale: Locale, resolvedLocale: Locale, raw: string): Post {
  const { data, content } = matter(raw);
  const result = postFrontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new InvalidPostError(slug, resolvedLocale, result.error.issues);
  }
  return { slug, locale, resolvedLocale, frontmatter: result.data, body: content.trim() };
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
  const contentDir = options.contentDir ?? DEFAULT_POSTS_DIR;
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
export async function listPostSlugs(options: ReadPostOptions = {}): Promise<string[]> {
  const contentDir = options.contentDir ?? DEFAULT_POSTS_DIR;
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
