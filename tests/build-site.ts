import { fileURLToPath } from "node:url";
import { build } from "astro";

// The site tests read the compiled HTML, so build it once before they run.
export default async function setup(): Promise<void> {
  await build({ root: fileURLToPath(new URL("..", import.meta.url)), logLevel: "warn" });
}
