import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

const src = fileURLToPath(new URL("../src", import.meta.url));

async function componentFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
    .map((entry) => join(entry.parentPath, entry.name));
}

// A color or size written in brackets (`text-[#333]`, `text-[0.8rem]`, `w-[calc(…)]`) bypasses
// the tokens of the @theme block, so the theme could no longer be changed from there alone.
const arbitraryValue =
  /\b[\w:-]+-\[[^\]]*(?:#|\d(?:rem|px|em|%|vw|vh)|rgb|hsl|oklch|calc)[^\]]*\]/g;

test("components style themselves only with theme tokens", async () => {
  const offenders: string[] = [];
  for (const file of await componentFiles(src)) {
    const matches = (await readFile(file, "utf8")).match(arbitraryValue) ?? [];
    offenders.push(...matches.map((match) => `${relative(src, file)}: ${match}`));
  }
  expect(offenders).toEqual([]);
});
