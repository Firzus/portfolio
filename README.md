# Portfolio

Source of Lilian PRIEU's portfolio: a site in French (`/`) and English (`/en/`), rendered by a Node server and shipped as a Docker image.

## Stack

- [TanStack Start](https://tanstack.com/start) (React) with server-side rendering, built for Node by [Nitro](https://nitro.build)
- [Paraglide JS](https://paraglidejs.com) for interface texts and localized URLs
- [Base UI](https://base-ui.com) under components owned in this repository, with `cn()` and [class-variance-authority](https://cva.style)
- [Tailwind CSS v4](https://tailwindcss.com), [GSAP](https://gsap.com) and [Iconoir](https://iconoir.com)
- [Vite+](https://viteplus.dev) (`vp`) for formatting, linting, type checking and tests

## Getting started

Requires [Vite+](https://viteplus.dev/guide/); it provides the Node.js and pnpm versions pinned in `.node-version` and `package.json`.

```sh
vp install         # also compiles the Paraglide messages
vp run dev         # http://localhost:3000
```

| Command        | Purpose                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| `vp check`     | Format, lint and type check (`vp check --fix` applies fixes)                                            |
| `vp test`      | Build the site, start its server and test the HTML it renders in both languages, including the 404 page |
| `vp run build` | Check translations, then build the server into `.output/`                                               |
| `vp run start` | Serve the build on port 3000 (`PORT` changes it)                                                        |

## Translations

Interface texts live in `messages/fr.json` (base language) and `messages/en.json`. Every key must exist and be non-empty in both files: `vp run build` fails otherwise, because Paraglide would silently fall back to French.

Routes live once in `src/routes/`; the English version of each is served under `/en/`.

## Docker

The `Dockerfile` builds the site and runs its server on port 3000; Coolify can deploy it as is.

```sh
docker build -t portfolio .
docker run --rm -p 127.0.0.1:3000:3000 portfolio
```

The build fails when a translation is missing or empty. The image declares a health check on `/`.

Set `GITHUB_TOKEN` on the running server (a GitHub token with no permission is enough) to keep the home page's GitHub calendar current: the server asks GitHub's API for it at most once a week. Without the token, or while GitHub cannot be reached, the page shows the copy saved in `src/content/github-activity.json`, which `GITHUB_TOKEN=<token> node scripts/github-activity.ts` refreshes.
