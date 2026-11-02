import { defineConfig } from "vite-plus";

// Skills under .agents/ are vendored from their upstream repositories
// (see skills-lock.json); formatting or linting them would diverge from it.
const vendored = [".agents/**"];

export default defineConfig({
  fmt: {
    ignorePatterns: vendored,
  },
  lint: {
    ignorePatterns: vendored,
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/build-site.ts"],
  },
});
