// Builds the client, the server entry and the prerendered pages into $OUT (default "dist"),
// so several builds can run side by side without overwriting each other.
import { join } from "node:path";
import { build } from "vite";

const root = import.meta.dirname;
const out = process.env.OUT ?? "dist";
await build({ root, logLevel: "warn", build: { outDir: join(out, "client"), emptyOutDir: true } });
await build({ root, logLevel: "warn", build: { ssr: "src/entry-server.tsx", outDir: join(out, "server"), emptyOutDir: true } });
process.env.OUT = out;
await import("./prerender.mjs");
