import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, expect, test } from "vite-plus/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};
const checkScript = manifest.scripts["check:translations"] ?? "";

let workdir: string | undefined;

afterEach(async () => {
  if (workdir) await rm(workdir, { recursive: true, force: true });
  workdir = undefined;
});

/** Runs the translation check on a copy of the messages, after `edit` changes the English ones. */
async function checkWithEnglish(edit: (messages: Record<string, string>) => void): Promise<number> {
  workdir = await mkdtemp(join(tmpdir(), "portfolio-translations-"));
  await cp(
    join(root, "project.inlang/settings.json"),
    join(workdir, "project.inlang/settings.json"),
  );
  await cp(join(root, "messages"), join(workdir, "messages"), { recursive: true });
  const englishFile = join(workdir, "messages/en.json");
  const english = JSON.parse(await readFile(englishFile, "utf8")) as Record<string, string>;
  edit(english);
  await writeFile(englishFile, JSON.stringify(english, null, 2));
  const result = spawnSync(checkScript, {
    cwd: workdir,
    shell: true,
    stdio: "ignore",
    env: {
      ...process.env,
      PATH: `${join(root, "node_modules/.bin")}${delimiter}${process.env.PATH}`,
    },
  });
  return result.status ?? 1;
}

test("the build runs the translation check first", () => {
  expect(manifest.scripts.build).toMatch(/^vp run check:translations && /);
});

test("the translation check passes on complete messages", async () => {
  expect(await checkWithEnglish(() => {})).toBe(0);
});

test("the translation check fails on a missing translation", async () => {
  expect(await checkWithEnglish((messages) => delete messages.job_title)).not.toBe(0);
});

test("the translation check fails on an empty translation", async () => {
  expect(await checkWithEnglish((messages) => (messages.job_title = ""))).not.toBe(0);
});
