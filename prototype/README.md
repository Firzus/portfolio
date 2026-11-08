# FIR-419 art direction prototype

Three directions for the portfolio, inspired by aihero.dev, each with the home page and a
case-study page built from the same content (`src/content.ts`). React, Base UI and Tailwind v4;
every page is prerendered, so it reads without JavaScript.

```sh
pnpm install --ignore-workspace
pnpm build
pnpm preview   # http://127.0.0.1:4319/
```

- `/` lists the directions; `/a/`, `/b/`, `/c/` are their home pages, `/<id>/projets/<slug>/` their project pages.
- `directions/` holds the direction sheets dealt by the design-taste-frontend skill.
- `captures/` holds the first screen of each direction at 1440, 768 and 390 px (home above, Huzounet below).
