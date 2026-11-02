// Prepares a fresh worktree created by T3 Code (see t3.json). It runs before the
// dependencies are installed, so it may only use Node built-ins.
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";

const worktree = dirname(import.meta.dirname);
const defaultBranch = "origin/main";

function run(command: string, args: readonly string[]): number {
  const result = spawnSync(command, args, { cwd: worktree, stdio: "inherit" });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

function output(args: readonly string[]): string {
  return spawnSync("git", args, { cwd: worktree, encoding: "utf8" }).stdout.trim();
}

// T3 branches the worktree from the local base branch, which can lag behind origin.
// Being offline should not block work, so a failed fetch only skips the update.
if (run("git", ["fetch", "--prune", "--quiet", "origin"]) !== 0) {
  console.warn("Fetch failed: the worktree keeps its base commit.");
} else if (output(["status", "--porcelain"]) !== "") {
  // An agent may already have written files; leave its checkout alone.
  console.warn(`Local changes found: the worktree is not updated to ${defaultBranch}.`);
} else if (run("git", ["merge-base", "--is-ancestor", "HEAD", defaultBranch]) === 0) {
  if (run("git", ["merge", "--ff-only", "--quiet", defaultBranch]) !== 0) {
    throw new Error(`Unable to fast-forward the worktree to ${defaultBranch}.`);
  }
}

// A stale lockfile must fail here rather than be rewritten in the worktree.
// Installing also runs `prepare`, which compiles the Paraglide messages.
// Windows resolves the `vp` shim only through a shell.
const install = spawnSync("vp install --frozen-lockfile", {
  cwd: worktree,
  stdio: "inherit",
  shell: true,
});
if (install.error) throw install.error;
const installStatus = install.status ?? 1;
if (installStatus !== 0) {
  throw new Error(`vp install failed with exit code ${installStatus}.`);
}
