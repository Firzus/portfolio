# Portfolio

Source of Lilian PRIEU's portfolio: a static Astro site in French (`/`) and English (`/en/`).

## Stack

- [Astro](https://astro.build) in static output, without a server adapter
- [Paraglide JS](https://paraglidejs.com) for interface texts, with Astro i18n routing
- [Tailwind CSS v4](https://tailwindcss.com), [GSAP](https://gsap.com), [three.js](https://threejs.org) and [Iconoir](https://iconoir.com)
- [Vite+](https://viteplus.dev) (`vp`) for formatting, linting, type checking and tests

## Getting started

Requires [Vite+](https://viteplus.dev/guide/); it provides the Node.js and pnpm versions pinned in `.node-version` and `package.json`.

```sh
vp install         # also compiles the Paraglide messages
vp run dev         # http://localhost:4321
```

| Command              | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| `vp check`           | Format, lint and type check (`vp check --fix` applies fixes) |
| `vp run check:astro` | Type check `.astro` files                                    |
| `vp test`            | Build the site and test the compiled HTML of both languages  |
| `vp run build`       | Check translations, then build the static site into `dist/`  |
| `vp run preview`     | Serve `dist/` locally                                        |

## Translations

Interface texts live in `messages/fr.json` (base language) and `messages/en.json`. Every key must exist and be non-empty in both files: `vp run build` fails otherwise, because Paraglide would silently fall back to French.

Pages for each language live in `src/pages/` (French) and `src/pages/en/` (English).
