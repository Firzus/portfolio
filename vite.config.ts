import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite-plus";

// Skills under .agents/ are vendored from their upstream repositories
// (see skills-lock.json); formatting or linting them would diverge from it.
// The route tree and the Paraglide output are generated.
const ignored = [".agents/**", "src/routeTree.gen.ts", "src/paraglide/**"];

export default defineConfig({
  // The tests run the built server rather than the source, so the app plugins
  // stay out of the test runner, where TanStack Start would also start Nitro.
  plugins: process.env.VITEST
    ? []
    : [
        // Options live in project.inlang/paraglide.config.js, also read on install.
        paraglideVitePlugin({ project: "./project.inlang" }),
        tailwindcss(),
        tanstackStart(),
        nitro(),
        // React's plugin must come after TanStack Start's.
        viteReact(),
      ],
  fmt: {
    ignorePatterns: ignored,
  },
  lint: {
    ignorePatterns: ignored,
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/build-site.ts"],
    // Building the site and starting its server take longer than the default.
    hookTimeout: 30_000,
  },
});
