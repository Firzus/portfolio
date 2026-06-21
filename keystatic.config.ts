import { collection, config, fields } from "@keystatic/core";

import { locales } from "#/lib/i18n";

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
function projectsCollection(locale: (typeof locales)[number]) {
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
function blogCollection(locale: (typeof locales)[number]) {
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
  collections: Object.fromEntries([
    ...locales.map((locale) => [`projects_${locale}`, projectsCollection(locale)]),
    ...locales.map((locale) => [`blog_${locale}`, blogCollection(locale)]),
  ]),
});
