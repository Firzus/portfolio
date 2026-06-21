import { defineConfig } from "vite-plus";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";

const config = defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
  resolve: { tsconfigPaths: true },
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      strategy: ["url", "cookie", "baseLocale"],
      // Keystatic owns its own routing under /keystatic and talks to
      // /api/keystatic. Skip i18n middleware (locale redirect + URL
      // de-localization) so the Admin UI isn't locale-prefixed.
      routeStrategies: [
        { match: "/keystatic/:path(.*)?", exclude: true },
        { match: "/api/keystatic/:path(.*)?", exclude: true },
        // The RSS feed picks its locale from `?locale=`, not the URL prefix.
        { match: "/api/blog/:path(.*)?", exclude: true },
      ],
    }),
    devtools(),
    // On Vercel, build with the Nitro `vercel` preset (Build Output API v3 in
    // `.vercel/output`). Locally / elsewhere, Nitro auto-detects `node-server`.
    nitro({
      preset: process.env.VERCEL ? "vercel" : undefined,
      rollupConfig: { external: [/^@sentry\//] },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
