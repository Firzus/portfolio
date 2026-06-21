import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { InvalidPostError, listPosts, listPostSlugs, readPost } from "#/lib/content/posts";

const VALID_EN = `---
title: Sample Post
summary: A valid sample post.
publishedDate: 2025-01-15
tags:
  - meta
  - engineering
---

# Body

Some MDX content.
`;

const VALID_EN_SECOND = `---
title: Another Post
summary: A second valid post.
publishedDate: 2025-03-20
---

Body two.
`;

const VALID_FR = `---
title: Article Exemple
summary: Un article valide.
publishedDate: 2025-01-15
---

# Corps

Contenu MDX.
`;

const DRAFT_EN = `---
title: Draft Post
summary: Not ready yet.
publishedDate: 2025-02-01
draft: true
---

Body.
`;

const MISSING_DATE = `---
title: Missing Date
summary: No published date.
---

Body.
`;

const BAD_DATE = `---
title: Bad Date
summary: Malformed date.
publishedDate: not-a-date
---

Body.
`;

const MISSING_REQUIRED = `---
title: Missing Summary
publishedDate: 2025-01-01
---

Body.
`;

let contentDir: string;

beforeAll(async () => {
  const root = await mkdtemp(path.join(tmpdir(), "posts-test-"));
  contentDir = path.join(root, "blog");
  await mkdir(path.join(contentDir, "en"), { recursive: true });
  await mkdir(path.join(contentDir, "fr"), { recursive: true });

  await writeFile(path.join(contentDir, "en", "sample.mdx"), VALID_EN);
  await writeFile(path.join(contentDir, "en", "another.mdx"), VALID_EN_SECOND);
  await writeFile(path.join(contentDir, "fr", "sample.mdx"), VALID_FR);
  await writeFile(path.join(contentDir, "en", "draft.mdx"), DRAFT_EN);
  await writeFile(path.join(contentDir, "en", "missing-date.mdx"), MISSING_DATE);
  await writeFile(path.join(contentDir, "en", "bad-date.mdx"), BAD_DATE);
  await writeFile(path.join(contentDir, "en", "missing-required.mdx"), MISSING_REQUIRED);
});

afterAll(async () => {
  await rm(path.dirname(contentDir), { recursive: true, force: true });
});

describe("readPost", () => {
  it("parses valid frontmatter and body", async () => {
    const post = await readPost("sample", "en", { contentDir });
    expect(post).not.toBeNull();
    expect(post?.frontmatter).toMatchObject({
      title: "Sample Post",
      publishedDate: "2025-01-15",
      tags: ["meta", "engineering"],
    });
    expect(post?.body).toContain("Some MDX content.");
    expect(post?.body).not.toContain("---");
  });

  it("defaults optional 'tags' and 'draft'", async () => {
    const post = await readPost("another", "en", { contentDir });
    expect(post?.frontmatter.tags).toEqual([]);
    expect(post?.frontmatter.draft).toBe(false);
  });

  it("serves the localized file when present", async () => {
    const post = await readPost("sample", "fr", { contentDir });
    expect(post?.resolvedLocale).toBe("fr");
    expect(post?.frontmatter.title).toBe("Article Exemple");
  });

  it("falls back to en when the localized file is missing", async () => {
    const post = await readPost("another", "fr", { contentDir });
    expect(post?.locale).toBe("fr");
    expect(post?.resolvedLocale).toBe("en");
    expect(post?.frontmatter.title).toBe("Another Post");
  });

  it("returns null for an unknown slug", async () => {
    const post = await readPost("does-not-exist", "en", { contentDir });
    expect(post).toBeNull();
  });

  it("rejects a missing required field", async () => {
    await expect(readPost("missing-required", "en", { contentDir })).rejects.toThrow(
      InvalidPostError,
    );
    await expect(readPost("missing-required", "en", { contentDir })).rejects.toThrow(/summary/);
  });

  it("rejects a missing published date", async () => {
    await expect(readPost("missing-date", "en", { contentDir })).rejects.toThrow(/publishedDate/);
  });

  it("rejects a malformed date", async () => {
    await expect(readPost("bad-date", "en", { contentDir })).rejects.toThrow(/publishedDate/);
  });
});

describe("listPostSlugs", () => {
  it("returns the canonical (en) slug set, sorted", async () => {
    const slugs = await listPostSlugs({ contentDir });
    expect(slugs).toEqual([
      "another",
      "bad-date",
      "draft",
      "missing-date",
      "missing-required",
      "sample",
    ]);
  });

  it("returns an empty array when the directory is absent", async () => {
    const slugs = await listPostSlugs({ contentDir: path.join(contentDir, "nope") });
    expect(slugs).toEqual([]);
  });
});

describe("listPosts", () => {
  it("reads valid posts with fallback, newest first, excluding drafts", async () => {
    const validDir = path.join(path.dirname(contentDir), "valid", "blog");
    await mkdir(path.join(validDir, "en"), { recursive: true });
    await mkdir(path.join(validDir, "fr"), { recursive: true });
    await writeFile(path.join(validDir, "en", "sample.mdx"), VALID_EN);
    await writeFile(path.join(validDir, "en", "another.mdx"), VALID_EN_SECOND);
    await writeFile(path.join(validDir, "en", "draft.mdx"), DRAFT_EN);
    await writeFile(path.join(validDir, "fr", "sample.mdx"), VALID_FR);

    const posts = await listPosts("fr", { contentDir: validDir });
    // Drafts excluded; sorted by publishedDate desc (another 2025-03-20 first).
    expect(posts.map((p) => p.slug)).toEqual(["another", "sample"]);
    expect(posts[0]?.resolvedLocale).toBe("en");
    expect(posts[1]?.resolvedLocale).toBe("fr");
  });

  it("includes drafts when requested", async () => {
    const draftDir = path.join(path.dirname(contentDir), "drafts", "blog");
    await mkdir(path.join(draftDir, "en"), { recursive: true });
    await writeFile(path.join(draftDir, "en", "sample.mdx"), VALID_EN);
    await writeFile(path.join(draftDir, "en", "draft.mdx"), DRAFT_EN);

    const posts = await listPosts("en", { contentDir: draftDir, includeDrafts: true });
    expect(posts.map((p) => p.slug)).toEqual(["draft", "sample"]);
  });
});
