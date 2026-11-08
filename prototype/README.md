# FIR-419 art direction prototype

The portfolio's art direction, inspired by aihero.dev: the home page and a case-study page per
project, built from `src/content.ts`. React, Base UI and Tailwind v4, with GPU shaders
(`shaders`), GSAP and Lenis for the liquid motion. Every page is prerendered, so it reads
without JavaScript.

```sh
pnpm install --ignore-workspace
pnpm build
pnpm preview   # http://127.0.0.1:4319/
```

- `/` and `/d/` are the home page, `/d/projets/<slug>/` the project pages.
- `lettering/` holds the source of the name's hand-drawn lettering and how it was generated and
  traced; `pnpm trace-lettering` retraces it after a change.
- `captures/` holds screenshots of the direction: the home page at 1440 and 390 px with the
  shaders running, the loading screen and the "Par où commencer" icons.
