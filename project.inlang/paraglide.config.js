import { defineConfig } from "@inlang/paraglide-js";

// Shared by the Vite plugin (vite.config.ts) and the `paraglide-js compile`
// command run on install, so both emit the same runtime.
export default defineConfig({
  outdir: "./src/paraglide",
  outputStructure: "message-modules",
  emitTsDeclarations: true,
  strategy: ["url", "baseLocale"],
  // English is prefixed; French, the base locale, owns the root. The specific
  // pattern comes first because the first match wins.
  urlPatterns: [
    {
      pattern: "/:path(.*)?",
      localized: [
        ["en", "/en/:path(.*)?"],
        ["fr", "/:path(.*)?"],
      ],
    },
  ],
});
