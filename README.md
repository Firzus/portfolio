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

## Project structure

```
src/
  routes/
    __root.tsx     # Root HTML document (head, scripts)
    index.tsx      # / route — SSR home
  router.tsx       # Router creation
  styles.css       # Tailwind entry
vite.config.ts     # Single Vite+ config (TanStack Start + Nitro + Tailwind)
```
