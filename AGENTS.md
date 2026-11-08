Look up TanStack Start, TanStack Router, Base UI and Paraglide JS in their current documentation instead of answering from memory, because their APIs change between versions.

## UI components

Build the interface from small React components owned in this repository, following the shadcn/ui approach without installing shadcn/ui: the code lives here and is edited directly, each component wraps one element (button, input, select, carousel…) with default styling, and callers compose and restyle it instead of copying it. Interactive behavior comes from [Base UI](https://base-ui.com) (`@base-ui/react`), which provides unstyled, accessible parts.

- Before creating a component, look in `src/components/ui/`; extend an existing one with a variant rather than adding a near-duplicate. Page sections compose these components and live in `src/components/`.
- Give a component with several parts one folder, one file per part and an `index.ts` re-exporting them (e.g. `card/Card.tsx`, `card/CardHeader.tsx`), so callers arrange the parts themselves.
- For an interactive widget (dialog, menu, select, tabs, tooltip…), wrap the Base UI part rather than writing focus, keyboard or ARIA handling yourself. For a static element, start from the native element with the right semantics (`<button>`, `<a>`, `<input>`).
- Type props as `React.ComponentProps<"element">`, or the props of the wrapped Base UI part, plus the component's own props. Destructure `className`, merge it last with `cn()`, and spread the remaining props onto the root element, so callers can set `id`, `aria-*` or `data-*` and override any default class.
- `cn()` lives in `src/lib/utils.ts` and combines `clsx` and `tailwind-merge`. `tailwind-merge` only recognizes Tailwind's default scales: register any custom token it cannot classify with `extendTailwindMerge` (a custom `--text-*` size, for example, is otherwise mistaken for a text color and dropped).
- Declare variants with `class-variance-authority` (`variant`, `size`, default variants) and export the variants function (e.g. `buttonVariants`) so another element, such as a link, can share the look.
- Mark each part with `data-slot="<part>"`. Style state through the data attributes Base UI sets (`data-[open]:…`, `data-[disabled]:…`) or that you expose (`data-state="open"`), with Tailwind variants rather than conditional classes.
- Pages are rendered on the server: a component reads no browser API (`window`, `localStorage`) while rendering, only in effects or event handlers, so the content stays readable without JavaScript.
- Icons come from `iconoir-react`; mark decorative icons `aria-hidden="true"`.
- Keep components accessible: every control has a label, focus is visible (`focus-visible:` with a theme token), the keyboard reaches everything, and animations respect `prefers-reduced-motion`.

## Translations

- Interface texts live in `messages/fr.json` (French, the base locale, served at `/`) and `messages/en.json` (served under `/en/`), and are read through `m` from `src/paraglide/messages.js`. Never write a user-visible text directly in a component, except a proper name that no language translates (such as "Lilian PRIEU").
- Declare each route once in `src/routes/`, without locale: the router's `rewrite` (see `src/router.tsx`) maps `/en/…` to the same route.
- Link to another language with a plain `<a>` built from `localizedPages()` in `src/lib/site.ts`, not a router link, so the server renders the page in the new locale.

## Theme

- Design tokens are defined once, in the `@theme` block of `src/styles/global.css`, under semantic names (`surface`, `ink`, `muted`, `accent`, `line`, `font-display`…). Style components only with these utilities (`bg-surface`, `text-ink`), never with arbitrary values (`text-[#333]`), so the whole site changes theme from that one block.
- Tailwind's default palette is disabled (`--color-*: initial`), so a utility such as `bg-zinc-100` generates no CSS. When a value has no token, add a semantic token to `@theme` and use it.
- Before defining or changing tokens, read the `tailwind-design-system` skill (`.agents/skills/tailwind-design-system/`) for Tailwind v4 theming patterns; for visual direction, use `design-taste-frontend`.
