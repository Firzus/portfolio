import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vite-plus/test";

const src = fileURLToPath(new URL("../src", import.meta.url));
// Generated code, which no component styling reaches.
const generated = ["paraglide", "routeTree.gen.ts"];

async function sourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((file) => !generated.some((part) => relative(src, file).startsWith(part)));
}

// Variants that select an element (`data-[open]:`, `group-[.is-open]/item:`, `nth-[3]:`…) set no
// value, so they are removed before the search.
const stateVariant =
  /(?:(?:group-|peer-|in-)?(?:data|aria|has|not|supports|nth(?:-last)?(?:-of-type)?)|group|peer)-\[[^\]]*\](?:\/[\w-]+)?:/g;

/**
 * Finds the styling that bypasses the tokens of the @theme block, so the theme could no longer be
 * changed from there alone: an arbitrary value (`text-[#333]`, `leading-[1.1]`), a CSS variable
 * shorthand (`bg-(--brand)`), an arbitrary property (`[color:red]`) or an inline style.
 */
export function bypassesTheme(source: string): string[] {
  const code = source.replace(stateVariant, " ");
  const patterns = [
    /[\w-]+-\[[^\]]+\]/g,
    /[\w-]+-\([\w-]*:?--[^)]+\)/g,
    // An opacity modifier with an arbitrary value (`text-ink/[.37]`, `bg-ink/(--a)`).
    /\/[[(][^\])]+[\])]/g,
    // No space after the colon, so a TypeScript index signature (`[key: string]`) is not taken.
    /\[[\w-]+:[^\s\]]+\]/g,
    /style=\{/g,
  ];
  return patterns.flatMap((pattern) => code.match(pattern) ?? []);
}

describe("bypassesTheme", () => {
  test.each([
    "text-[#333]",
    "min-h-[100dvh]",
    "leading-[1.1]",
    "bg-[var(--x)]",
    "bg-(--brand)",
    "[color:#333]",
    "md:[font-size:12px]",
    "bg-(color:--brand)",
    "text-ink/[.37]",
    "bg-ink/(--a)",
    "<p style={{ color: 'red' }}>",
  ])("flags %s", (source) => {
    expect(bypassesTheme(source)).not.toEqual([]);
  });

  test.each([
    "text-ink bg-ground",
    "text-ink/60",
    "data-[open]:bg-surface",
    "aria-[current=page]:text-ink",
    "group-data-[open]/item:text-ink",
    "in-data-[open]:text-ink",
    "group-[.is-open]:text-ink",
    "peer-[:checked]:text-ink",
    "nth-[3]:text-ink",
    "type Map = { [key: string]: unknown };",
  ])("accepts %s", (source) => {
    expect(bypassesTheme(source)).toEqual([]);
  });
});

test("the source styles itself only with theme tokens", async () => {
  const offenders: string[] = [];
  for (const file of await sourceFiles(src)) {
    const matches = bypassesTheme(await readFile(file, "utf8"));
    offenders.push(...matches.map((match) => `${relative(src, file)}: ${match}`));
  }
  expect(offenders).toEqual([]);
});
