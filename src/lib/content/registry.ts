/**
 * Build-time content registry. `import.meta.glob` statically inlines every MDX
 * file into the bundle, so content ships inside the serverless function and is
 * never read through a runtime `fs`/`process.cwd()` path the bundler can't
 * trace (which silently breaks on the Vercel/Nitro preset). The fs reader is
 * kept only for tests, which inject a `contentDir` override.
 */
type RawMap = Record<string, string>;

const projectFiles = import.meta.glob("/content/projects/**/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as RawMap;

const blogFiles = import.meta.glob("/content/blog/**/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as RawMap;

export type ContentKind = "projects" | "blog";

const maps: Record<ContentKind, RawMap> = {
  projects: projectFiles,
  blog: blogFiles,
};

const MDX_EXTENSION = ".mdx";

/** Read a single localized file's raw contents, or `null` when absent. */
export function readRegistryRaw(kind: ContentKind, locale: string, slug: string): string | null {
  return maps[kind][`/content/${kind}/${locale}/${slug}${MDX_EXTENSION}`] ?? null;
}

/** Slugs present in a given locale directory, sorted. */
export function listRegistrySlugs(kind: ContentKind, locale: string): string[] {
  const prefix = `/content/${kind}/${locale}/`;
  return Object.keys(maps[kind])
    .filter((file) => file.startsWith(prefix) && file.endsWith(MDX_EXTENSION))
    .map((file) => file.slice(prefix.length, -MDX_EXTENSION.length))
    .sort();
}

/** Locales in which a given slug actually has its own file (no fallback). */
export function listRegistryLocales(kind: ContentKind, slug: string): string[] {
  const base = `/content/${kind}/`;
  const suffix = `/${slug}${MDX_EXTENSION}`;
  return Object.keys(maps[kind])
    .filter((file) => file.startsWith(base) && file.endsWith(suffix))
    .map((file) => file.slice(base.length, file.length - suffix.length))
    .sort();
}
