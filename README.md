# Portfolio — Firzus

Personal portfolio (Agentic / AI Developer) built with **TanStack Start** in **SSR Node** mode, on the **Vite+ (`vp`)** toolchain with **pnpm**.

See PRD in [issue #2](https://github.com/Firzus/portfolio/issues/2).

## Requirements

- [Vite+ (`vp`)](https://viteplus.dev) installed globally
- Node.js 24+ and pnpm (managed by `vp`)

## Commands

| Command                          | Description                                                 |
| -------------------------------- | ----------------------------------------------------------- |
| `pnpm install` (or `vp install`) | Install dependencies                                        |
| `pnpm dev`                       | Start the dev server (SSR) on `http://localhost:3000`       |
| `pnpm build`                     | Production build (Nitro `node-server` preset)               |
| `pnpm start`                     | Run the production Node server (`.output/server/index.mjs`) |
| `vp check`                       | Format + lint + type-check in one pass                      |
| `pnpm test`                      | Run tests                                                   |

> Built-in `vp` commands (`vp dev`, `vp build`, `vp test`) run the bundled tool. The `package.json` scripts wrap them.

After a production build, the server listens on `PORT` (default `3000`):

```bash
pnpm build
PORT=3000 pnpm start
```

## Key dependency versions

| Dependency               | Version                  |
| ------------------------ | ------------------------ |
| `@tanstack/react-start`  | 1.168.x                  |
| `@tanstack/react-router` | 1.170.x                  |
| `react` / `react-dom`    | 19.2.x                   |
| `vite` (Vite+ core)      | 8.x                      |
| `nitro`                  | 3.x (node-server preset) |
| `tailwindcss`            | 4.x                      |
| `typescript`             | 6.x                      |
| Node.js                  | 24.x                     |
| pnpm                     | 10.33.x                  |

## Internationalization (i18n)

Localization uses **Paraglide JS + inlang** with locale-prefixed routing. Locales: `en` (default, no prefix), `fr`, `es`, `de`.

| Concern           | Where                                                                |
| ----------------- | -------------------------------------------------------------------- |
| Locale + plugins  | `project.inlang/settings.json`                                       |
| Translations      | `messages/{locale}.json` (one file per locale)                       |
| Compiled output   | `src/paraglide/` (generated, git-ignored)                            |
| URL rewriting     | `rewrite` option in `src/router.tsx` (`deLocalizeUrl`/`localizeUrl`) |
| SSR locale        | `src/server.ts` (`paraglideMiddleware`)                              |
| Locale resolution | `src/lib/i18n.ts` (`resolveLocale`, fallback to `en`)                |

URLs: `/` and `/about` serve `en`; `/fr`, `/es`, `/de` prefix the other locales. `hreflang` alternates (plus `x-default`) are emitted in `src/routes/__root.tsx`.

### Workflow

- Messages compile automatically via the Paraglide Vite plugin on `pnpm dev` / `pnpm build`.
- To add a UI string: add the key to every `messages/{locale}.json`, then use it as `m.<key>()` from `#/paraglide/messages`.
- Manual compile (rarely needed): `npx @inlang/paraglide-js compile --project ./project.inlang --outdir ./src/paraglide`.

## Project structure

```
src/
  routes/
    __root.tsx     # Root HTML document (head, hreflang, locale redirect)
    index.tsx      # / route — SSR home (translated)
  components/
    locale-switcher.tsx  # Language selector
  lib/
    i18n.ts        # resolveLocale + fallback (tested seam)
  paraglide/       # Generated message + runtime modules (git-ignored)
  router.tsx       # Router creation + locale URL rewrite
  server.ts        # SSR entry wrapping paraglideMiddleware
  styles.css       # Tailwind entry
messages/          # Translations, one JSON per locale
project.inlang/    # inlang project settings
vite.config.ts     # Single Vite+ config (Paraglide + TanStack Start + Nitro + Tailwind)
```
