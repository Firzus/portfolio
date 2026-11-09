import { defineConfig } from "@inlang/paraglide-js";

// Shared by the Vite plugin (vite.config.ts) and the `paraglide-js compile`
// command run on install, so both emit the same runtime.
export default defineConfig({
  outdir: "./src/paraglide",
  outputStructure: "message-modules",
  emitTsDeclarations: true,
  strategy: ["url", "baseLocale"],
  // English is prefixed; French, the base locale, owns the root. Patterns are
  // tried in order and the first match wins, so translated paths come before
  // the catch-all, and inside each one the prefixed locale comes first.
  // Routes use the French path (`pattern`) and never see the English one.
  urlPatterns: [
    {
      pattern: "/agents-ia",
      localized: [
        ["en", "/en/ai-agents"],
        ["fr", "/agents-ia"],
      ],
    },
    {
      pattern: "/projets/:slug",
      localized: [
        ["en", "/en/projects/:slug"],
        ["fr", "/projets/:slug"],
      ],
    },
    {
      pattern: "/:path(.*)?",
      localized: [
        ["en", "/en/:path(.*)?"],
        ["fr", "/:path(.*)?"],
      ],
    },
  ],
});
