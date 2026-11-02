Look up Astro documentation, APIs, and best practices with the Astro docs MCP server (`astro-docs`) instead of answering from memory, because Astro APIs change between major versions.

## UI components

Build the interface from small components owned in this repository, following the shadcn/ui approach: the code lives here and is edited directly, each component wraps one element (button, input, select, carousel…) with default styling, and callers compose and restyle it instead of copying it. The site uses Astro without React, so components are `.astro` files built on native HTML elements and scripts.

- Before creating a component, look in `src/components/ui/`; extend an existing one with a variant rather than adding a near-duplicate. Page sections compose these components and live in `src/components/`.
- Give a component with several parts one folder, one file per part and an `index.ts` re-exporting them (e.g. `card/Card.astro`, `card/CardHeader.astro`), so callers arrange the parts themselves.
- Start from the native element with the right semantics and keyboard behavior (`<button>`, `<input>`, `<select>`, `<dialog>`, `popover`, `<details>`); add a script only for behavior the element lacks.
- Type props as `HTMLAttributes<"element">` from `astro/types` plus the component's own props. Destructure `class`, merge it last with `cn()`, and spread the remaining attributes onto the root element, so callers can set `id`, `aria-*` or `data-*` and override any default class.
- `cn()` lives in `src/lib/utils.ts` and combines `clsx` and `tailwind-merge`; create it, and install those packages, with the first component that needs it. `tailwind-merge` only recognizes Tailwind's default scales: register any custom token it cannot classify with `extendTailwindMerge` (a custom `--text-*` size, for example, is otherwise mistaken for a text color and dropped).
- Declare variants with `class-variance-authority` (`variant`, `size`, default variants) and export the variants function (e.g. `buttonVariants`) so another element, such as a link, can share the look.
- Mark each part with `data-slot="<part>"` and expose state as data attributes (`data-state="open"`), styled with Tailwind variants (`data-[state=open]:…`) rather than classes toggled from scripts.
- Write interactive behavior in the component's `<script>` as a custom element: Astro includes that script once per page however many instances render, and each element instance keeps its own state.
- Keep components accessible: every control has a label, focus is visible (`focus-visible:` with a theme token), the keyboard reaches everything, and animations respect `prefers-reduced-motion`.

## Theme

- Design tokens are defined once, in the `@theme` block of `src/styles/global.css`, under semantic names (`surface`, `ink`, `muted`, `accent`, `line`, `font-display`…). Style components only with these utilities (`bg-surface`, `text-ink`), never with arbitrary values (`text-[#333]`), so the whole site changes theme from that one block.
- Tailwind's default palette is disabled (`--color-*: initial`), so a utility such as `bg-zinc-100` generates no CSS. When a value has no token, add a semantic token to `@theme` and use it.
- Before defining or changing tokens, read the `tailwind-design-system` skill (`.agents/skills/tailwind-design-system/`) for Tailwind v4 theming patterns; for visual direction, use `design-taste-frontend`.
