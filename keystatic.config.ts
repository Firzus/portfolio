import { collection, config, fields } from "@keystatic/core";

import { contentLocales, type Locale } from "#/lib/i18n";

const categoryOptions = [
  { label: "Web", value: "web" },
  { label: "Desktop", value: "desktop" },
  { label: "Games", value: "games" },
  { label: "AI", value: "ai" },
] as const;

/**
 * Build a `projects` collection bound to one locale directory. Keystatic has no
 * native i18n, so we model the per-locale MDX layout
 * (`content/projects/{locale}/*`) as one collection per locale. The base locale
 * (`en`) is canonical; other locales are optional and fall back to `en` at read
 * time (see `src/lib/content/projects.ts`).
 */
function projectsCollection(locale: Locale) {
  return collection({
    label: `Projects (${locale.toUpperCase()})`,
    slugField: "title",
    path: `content/projects/${locale}/*`,
    format: { contentField: "content" },
    schema: {
      title: fields.slug({ name: { label: "Title" } }),
      summary: fields.text({
        label: "Summary",
        multiline: true,
        validation: { isRequired: true },
      }),
      role: fields.text({ label: "Role", validation: { isRequired: true } }),
      stack: fields.array(fields.text({ label: "Technology" }), {
        label: "Stack",
        itemLabel: (props) => props.value,
        // Zod requires a non-empty stack (schema.ts); mirror it here so the CMS
        // can't author content the reader will reject at parse time.
        validation: { length: { min: 1 } },
      }),
      category: fields.select({
        label: "Category",
        options: categoryOptions,
        defaultValue: "web",
      }),
      featured: fields.checkbox({ label: "Featured", defaultValue: false }),
      order: fields.integer({ label: "Order" }),
      liveUrl: fields.url({ label: "Live URL" }),
      repoUrl: fields.url({ label: "Repository URL" }),
      publishedDate: fields.date({ label: "Published date" }),
      decision: fields.text({
        label: "Key decision / trade-off",
        multiline: true,
        description: "The key technical decision or trade-off behind the project.",
      }),
      outcome: fields.object(
        {
          summary: fields.text({ label: "Outcome summary", multiline: true }),
          metrics: fields.array(
            fields.object({
              label: fields.text({ label: "Metric label" }),
              value: fields.text({ label: "Metric value" }),
            }),
            {
              label: "Metrics",
              itemLabel: (props) => `${props.fields.label.value}: ${props.fields.value.value}`,
            },
          ),
        },
        { label: "Outcome" },
      ),
      learnings: fields.array(fields.text({ label: "Learning" }), {
        label: "What I learned",
        itemLabel: (props) => props.value,
      }),
      content: fields.mdx({ label: "Content" }),
    },
  });
}

/**
 * Build a `blog` collection bound to one locale directory, mirroring the
 * per-locale MDX layout `content/blog/{locale}/*`. Same fallback model as
 * projects: `en` is canonical, other locales are optional (see
 * `src/lib/content/posts.ts`).
 */
function blogCollection(locale: Locale) {
  return collection({
    label: `Blog (${locale.toUpperCase()})`,
    slugField: "title",
    path: `content/blog/${locale}/*`,
    format: { contentField: "content" },
    schema: {
      title: fields.slug({ name: { label: "Title" } }),
      summary: fields.text({
        label: "Summary",
        multiline: true,
        validation: { isRequired: true },
      }),
      publishedDate: fields.date({
        label: "Published date",
        validation: { isRequired: true },
      }),
      tags: fields.array(fields.text({ label: "Tag" }), {
        label: "Tags",
        itemLabel: (props) => props.value,
      }),
      draft: fields.checkbox({ label: "Draft", defaultValue: false }),
      content: fields.mdx({ label: "Content" }),
    },
  });
}

export default config({
  storage: { kind: "local" },
  // Only expose editing surfaces for locales we actually ship content in, so
  // editors don't author es/de files no localized route meaningfully serves.
  collections: Object.fromEntries([
    ...contentLocales.map((locale) => [`projects_${locale}`, projectsCollection(locale)]),
    ...contentLocales.map((locale) => [`blog_${locale}`, blogCollection(locale)]),
  ]),
});
