// @ts-check
import { defineConfig } from "astro/config";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://portfolio.lprieu.dev",
  output: "static",
  trailingSlash: "always",
  // Must list the same locales as project.inlang/settings.json.
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [paraglideVitePlugin({ project: "./project.inlang" }), tailwindcss()],
    // three.js ships as one ~530 kB module; src/scripts/home.ts loads it
    // after the first paint, so its size does not warrant a warning.
    build: { chunkSizeWarningLimit: 600 },
  },
});
