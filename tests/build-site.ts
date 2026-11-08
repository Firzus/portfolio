import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// The site tests run the production server, so build it once before they run.
export default function setup(): void {
  // Windows resolves the `vp` shim only through a shell.
  const result = spawnSync("vp run build", {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    stdio: "inherit",
    shell: true,
    // The test runner's variables would change the build: vite.config.ts drops
    // the app plugins under VITEST, and NODE_ENV=test selects React's dev build.
    env: Object.fromEntries(
      Object.entries(process.env).filter(
        ([name]) => !name.startsWith("VITEST") && name !== "NODE_ENV",
      ),
    ),
  });
  if (result.status !== 0) {
    throw new Error(`vp run build failed with exit code ${result.status ?? "unknown"}.`);
  }
}
