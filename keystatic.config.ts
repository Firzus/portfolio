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
      content: fields.mdx({ label: "Content" }),
    },
  });
}

export default config({
  storage: { kind: "local" },
  collections: Object.fromEntries(
    locales.map((locale) => [`projects_${locale}`, projectsCollection(locale)]),
  ),
});
