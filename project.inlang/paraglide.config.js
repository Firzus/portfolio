import { defineConfig } from "@inlang/paraglide-js";

// Shared by the Vite plugin (astro.config.mjs) and the `paraglide-js compile`
// command, so both emit the same runtime.
export default defineConfig({
  outdir: "./src/paraglide",
  emitTsDeclarations: true,
  // "url" resolves the locale in browser scripts; during the static build,
  // src/middleware.ts stores it in the global variable.
  strategy: ["url", "globalVariable", "baseLocale"],
});
