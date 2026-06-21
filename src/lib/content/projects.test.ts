import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  InvalidProjectError,
  listProjects,
  listProjectSlugs,
  readProject,
} from "#/lib/content/projects";

const VALID_EN = `---
title: Sample Project
summary: A valid sample project.
role: Lead developer
stack:
  - TypeScript
  - React
category: web
featured: true
order: 1
liveUrl: https://example.com
repoUrl: https://github.com/example/sample
publishedDate: 2025-01-15
---

# Body

Some MDX content.
`;

const VALID_EN_SECOND = `---
title: Another Project
summary: A second valid project.
role: Contributor
stack:
  - Rust
category: ai
---

Body two.
`;

const CASE_STUDY_EN = `---
title: Case Study Project
summary: A project with the full case-study narrative.
role: Lead developer
stack:
  - TypeScript
category: web
decision: Chose content-as-code over a database-backed CMS.
outcome:
  summary: Shipped a fully server-rendered, typed content layer.
  metrics:
    - label: Languages
      value: "4"
    - label: Database
      value: None
learnings:
  - Designing the schema first paid off downstream.
  - Locale fallback belongs at the boundary.
---

Body.
`;

const BAD_OUTCOME = `---
title: Bad Outcome
summary: Outcome missing required summary.
role: Dev
stack:
  - TypeScript
category: web
outcome:
  metrics:
    - label: Languages
      value: "4"
---

Body.
`;

const VALID_FR = `---
title: Projet Exemple
summary: Un projet valide.
role: Developpeur principal
stack:
  - TypeScript
category: web
order: 1
---

# Corps

Contenu MDX.
`;

const INVALID_CATEGORY = `---
title: Bad Category
summary: Invalid category value.
role: Dev
stack:
  - TypeScript
category: mobile
---

Body.
`;

const MISSING_REQUIRED = `---
title: Missing Summary
role: Dev
stack:
  - TypeScript
category: web
---

Body.
`;

const BAD_URL = `---
title: Bad Url
summary: Malformed live url.
role: Dev
stack:
  - TypeScript
category: web
liveUrl: not-a-url
---

Body.
`;

const UNKNOWN_KEY = `---
title: Typo Key
summary: Has an unexpected frontmatter key.
role: Dev
stack:
  - TypeScript
category: web
fetured: true
---

Body.
`;

let contentDir: string;

beforeAll(async () => {
  const root = await mkdtemp(path.join(tmpdir(), "projects-test-"));
  contentDir = path.join(root, "projects");
  await mkdir(path.join(contentDir, "en"), { recursive: true });
  await mkdir(path.join(contentDir, "fr"), { recursive: true });

  await writeFile(path.join(contentDir, "en", "sample.mdx"), VALID_EN);
  await writeFile(path.join(contentDir, "en", "another.mdx"), VALID_EN_SECOND);
  await writeFile(path.join(contentDir, "fr", "sample.mdx"), VALID_FR);
  await writeFile(path.join(contentDir, "en", "case-study.mdx"), CASE_STUDY_EN);
  await writeFile(path.join(contentDir, "en", "bad-category.mdx"), INVALID_CATEGORY);
  await writeFile(path.join(contentDir, "en", "missing-required.mdx"), MISSING_REQUIRED);
  await writeFile(path.join(contentDir, "en", "bad-url.mdx"), BAD_URL);
  await writeFile(path.join(contentDir, "en", "bad-outcome.mdx"), BAD_OUTCOME);
  await writeFile(path.join(contentDir, "en", "unknown-key.mdx"), UNKNOWN_KEY);
});

afterAll(async () => {
  await rm(path.dirname(contentDir), { recursive: true, force: true });
});

describe("readProject", () => {
  it("parses valid frontmatter and body", async () => {
    const project = await readProject("sample", "en", { contentDir });
    expect(project).not.toBeNull();
    expect(project?.frontmatter).toMatchObject({
      title: "Sample Project",
      category: "web",
      featured: true,
      stack: ["TypeScript", "React"],
      liveUrl: "https://example.com",
    });
    expect(project?.body).toContain("Some MDX content.");
    expect(project?.body).not.toContain("---");
  });

  it("defaults optional 'featured' to false", async () => {
    const project = await readProject("another", "en", { contentDir });
    expect(project?.frontmatter.featured).toBe(false);
  });

  it("serves the localized file when present", async () => {
    const project = await readProject("sample", "fr", { contentDir });
    expect(project?.resolvedLocale).toBe("fr");
    expect(project?.frontmatter.title).toBe("Projet Exemple");
  });

  it("falls back to en when the localized file is missing", async () => {
    const project = await readProject("another", "fr", { contentDir });
    expect(project?.locale).toBe("fr");
    expect(project?.resolvedLocale).toBe("en");
    expect(project?.frontmatter.title).toBe("Another Project");
  });

  it("returns null for an unknown slug", async () => {
    const project = await readProject("does-not-exist", "en", { contentDir });
    expect(project).toBeNull();
  });

  it("rejects an invalid category with a clear error", async () => {
    await expect(readProject("bad-category", "en", { contentDir })).rejects.toThrow(
      InvalidProjectError,
    );
    await expect(readProject("bad-category", "en", { contentDir })).rejects.toThrow(/category/);
  });

  it("rejects a missing required field", async () => {
    await expect(readProject("missing-required", "en", { contentDir })).rejects.toThrow(/summary/);
  });

  it("rejects a malformed url", async () => {
    await expect(readProject("bad-url", "en", { contentDir })).rejects.toThrow(/liveUrl/);
  });

  it("parses the case-study narrative fields (decision, outcome, learnings)", async () => {
    const project = await readProject("case-study", "en", { contentDir });
    expect(project?.frontmatter.decision).toContain("content-as-code");
    expect(project?.frontmatter.outcome).toMatchObject({
      summary: "Shipped a fully server-rendered, typed content layer.",
      metrics: [
        { label: "Languages", value: "4" },
        { label: "Database", value: "None" },
      ],
    });
    expect(project?.frontmatter.learnings).toEqual([
      "Designing the schema first paid off downstream.",
      "Locale fallback belongs at the boundary.",
    ]);
  });

  it("leaves narrative fields undefined when absent", async () => {
    const project = await readProject("sample", "en", { contentDir });
    expect(project?.frontmatter.decision).toBeUndefined();
    expect(project?.frontmatter.outcome).toBeUndefined();
    expect(project?.frontmatter.learnings).toBeUndefined();
  });

  it("rejects unknown frontmatter keys (strict schema catches typos)", async () => {
    await expect(readProject("unknown-key", "en", { contentDir })).rejects.toThrow(
      InvalidProjectError,
    );
  });

  it("rejects an outcome missing its required summary", async () => {
    await expect(readProject("bad-outcome", "en", { contentDir })).rejects.toThrow(
      InvalidProjectError,
    );
    await expect(readProject("bad-outcome", "en", { contentDir })).rejects.toThrow(/summary/);
  });
});

describe("listProjectSlugs", () => {
  it("returns the canonical (en) slug set, sorted", async () => {
    const slugs = await listProjectSlugs({ contentDir });
    expect(slugs).toEqual([
      "another",
      "bad-category",
      "bad-outcome",
      "bad-url",
      "case-study",
      "missing-required",
      "sample",
      "unknown-key",
    ]);
  });

  it("returns an empty array when the directory is absent", async () => {
    const slugs = await listProjectSlugs({ contentDir: path.join(contentDir, "nope") });
    expect(slugs).toEqual([]);
  });
});

describe("listProjects", () => {
  it("reads valid projects with fallback and sorts by order then title", async () => {
    // Only include the valid fixtures to avoid throwing on the invalid ones.
    const validDir = path.join(path.dirname(contentDir), "valid", "projects");
    await mkdir(path.join(validDir, "en"), { recursive: true });
    await mkdir(path.join(validDir, "fr"), { recursive: true });
    await writeFile(path.join(validDir, "en", "sample.mdx"), VALID_EN);
    await writeFile(path.join(validDir, "en", "another.mdx"), VALID_EN_SECOND);
    await writeFile(path.join(validDir, "fr", "sample.mdx"), VALID_FR);

    const projects = await listProjects("fr", { contentDir: validDir });
    expect(projects.map((p) => p.slug)).toEqual(["sample", "another"]);
    // sample (fr) localized, another falls back to en.
    expect(projects[0]?.resolvedLocale).toBe("fr");
    expect(projects[1]?.resolvedLocale).toBe("en");
  });
});
