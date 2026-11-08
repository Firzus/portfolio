# DIRECTION SHEET — The pinned poster
seed 1022862820 · drawn 2026-11-08 · sector personal-portfolio
Brief: Lilian PRIEU, software engineer: video games (Lysandra), player tools (Huzounet) and a Unity visual scripting kernel (Atelier)

| | |
| --- | --- |
| Direction | The pinned poster |
| Hero | Pinned title over portraits |
| Type | Cabinet Grotesk |
| Colour | Orange and black |
| Sections | work (Small index, large picture) → about (Pinned title, portraits pass) → contact (The email as display type) → footer (Name first, places under it) |
| Motion | Pinned story |
| Photographs | the "Architecture" set, as atmosphere |

This is the direction for this build. Adopt it. Do not blend it with the layout you would have made anyway,
and do not redraw because it is unfamiliar: unfamiliar is the point. Redraw a slot only when it conflicts
with a stated brand constraint or needs an asset that does not exist, and say why in your report.

The parts of this sheet were written separately and will disagree in small ways. Settle every disagreement in this order:
**house rules** (including type no smaller than 13px and body text of 16px or more) → **the direction** (the idea, the composition habits, where the
one accent goes) → **the type system and the palette** (which face does which job, the five size steps, which colour is the ground and where the
accent goes) → **the hero blueprint** → **the section blueprints**. Under each blueprint below, "Adjusted for this page" lists where it disagrees.
In practice: take geometry from blueprints (columns, proportions, what sits where) and take everything else from above them. Map every size a
blueprint names onto one of your five type steps instead of adding a sixth. Use one button shape, one corner radius and one pair of page margins on
the whole page, whatever individual blueprints say. If a blueprint names a kind of typeface (a light serif, a heavy grotesk), use the dealt face.

## 1. The idea
Something stays put while everything else changes. A title holds its place across the viewport and the images beneath it swap; the name is split to two opposite corners and the page passes between the halves; a single frame stays centred while its contents change. Every scroll step is a new cover of the same magazine. The idea suits subjects that are a series (a book of portraits, a line-up, a collection, a set of projects): the fixed element says what the series is, the changing element shows its members.

Before anything else, write one sentence in your notes: "On this page, <the subject's own material> becomes <the device>."
Fill the first blank from your inventory of what only this client has (its name and what it means, its street, its numbers, its
constraint), then put the nearest competitor in the sentence: if it still works, the idea is the category's, not the client's.
Then name the one live thing the visitor can do on the page (SKILL.md step 4).

## 2. Composition
A sticky layer holds the fixed element for the height of two to three viewports: usually the title at 10–14vw across the middle or top of the screen, or two words pinned to the top-left and bottom-right corners. Under it, a stack of full-height panels scrolls by, each a single large photograph (portrait 4:5, centred, 40–50% of the viewport wide) with one line of caption at the same small size everywhere. The title sits above the images in the stacking order and uses `mix-blend-mode: difference` or a solid colour that reads on every panel. When the pinned run ends, the page releases into ordinary flowing sections with a narrow measure. Build with `position: sticky`; never hijack the scroll.

## 3. Type — Cabinet Grotesk
A heavy sans with tight joins and an eccentric lowercase, friendly but loud. Suits bookshops, food, consumer subscriptions and marketing studios.
```html
<link rel="preconnect" href="https://api.fontshare.com">
<link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,800&display=swap" rel="stylesheet">
```
- Display: **Cabinet Grotesk** — weight 800 · tracking -0.035em · leading 0.9 · lowercase or sentence case, one or two words per line
- Text: **Cabinet Grotesk** — 400 for body, 500 for emphasis · leading 1.5 · tracking 0
```css
:root {
  --step-small: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem);
  --step-body: clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);
  --step-lead: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);
  --step-head: clamp(2.5rem, 1.2rem + 5vw, 5.5rem);
}
```
The pinned title is the only large type on the page. Captions and body share one small size (15–17px). Tight tracking and solid weight so the title reads over photographs.
The direction decides sizes and how many of them; the type system decides how this face is set. Where the two give different tracking or leading, use the values of the type system: they are tuned to this face.
The display size itself comes from the hero blueprint below.

## 4. Colour — Orange and black
```css
:root {
  --bg: #ff7a1f;
  --surface: #ff8633;
  --ink: #050f16;
  --muted: #5a2306;
  --accent: #050f16;
  --accent-ink: #ff7a1f;
  --field-1: #ffffff;  --field-1-ink: #050f16;
}
```
Hot orange is the page: one flat field with blue-black type, flipping at a hard horizontal seam to a white section when the content needs a rest. The button is a solid block of the same blue-black with orange text, and every other colour comes from the objects shown.
One strong title colour against a pale or dark ground. Each panel may take its own flat ground colour sampled from its photograph.

## 5. Imagery
**The project has no photographs of its own yet.** First choice: **real pictures of the subject's world from the open collections**: its city and street in old postcards and photographs, an old map of the neighbourhood, its materials up close, its trade in engravings, museum objects of its kind (references/imagery.md §3). Start with `node C:/Users/User/.t3/worktrees/portfolio/t3-53ccf175/.agents/skills/design-taste-frontend/scripts/assets.mjs "scripting kernel"`, then queries from your inventory (its street, its materials, its trade's tools and history). Download what you use into the project with `--get` and credit every one on the page (`--credits` prints the footer line). They show the world around the client, never the client's own room, dish, product, person or team. Second, for what no honest picture exists of: draw the subject's own things in code, large, in one flat graphic language and the palette's real colours (its tiles, its windows, its objects; references/imagery.md §8). Third: the dealt photographs, only where an honestly generic picture fits (the sea, the weather, a material), never one a visitor could take for the thing itself and never an unrelated scene. One treatment for all of them. If this direction is built on photographs, plan the set before building (four to six pictures of one family) and reuse them at different crops and scales instead of finding or drawing a new picture for every slot; keep drawings as `<symbol>` + `<use>` or generate them with a small script so the page stays light. List every found picture (with its source and licence), every dealt photograph and every drawing that stands in for photography in your report.

A series of photographs with the same crop ratio and the same framing (all portraits, all objects, all rooms), so that swapping them reads as one image changing. Five to eight in the pinned run.

**Floor (the inspector checks it):** at least four real pictures on the page, usually six to twelve; SVG drawings do not count. One moving picture where an honest clip exists: `node <skill>/scripts/assets.mjs --video "<query>"`, used as a muted loop with a poster frame. Whatever this direction says about pictures, it is carried out with real ones.

Photographs dealt for this build, from the "Architecture" set (structure, lines, bridges, facades and building interiors)
Order of preference for imagery: (1) the project's own photographs and product shots; (2) images you generate, if an image tool is
available; (3) real pictures of the subject's world found in the open collections (assets.mjs, downloaded and credited on the page);
(4) drawings of the subject in code; (5) these. They are real photographs (Unsplash licence, served by picsum.photos) of places, light and
texture. They are atmosphere, never a stand-in for a specific product, dish, person or interface. List the ones you use in your report so
they can be replaced.
- `https://picsum.photos/id/508/1600/1000` — Tall pointed vaults and pale columns of a church interior · light tone · cream, warm grey, soft orange · native portrait · photo: Jeff Sheldon
- `https://picsum.photos/id/618/1600/1000` — Curving glass and steel lattice roof in black and white · light tone · white, grey, black · black-and-white · native landscape · photo: Mika Ruusunen
- `https://picsum.photos/id/887/1600/1000` — White apartment block facade with repeating balconies and windows · light tone · white, pale grey, soft red · native landscape · photo: Roman Kraft
- `https://picsum.photos/id/942/1600/1000` — White angular concrete building against a black sky · dark tone · black, white, pale grey · black-and-white · calm area: top · native landscape · photo: Carl Nenzen Loven
- `https://picsum.photos/id/620/1600/1000` — White arched bridge spanning grey water under a pale sky · light tone · white, pale grey, charcoal · black-and-white · calm area: bottom · native landscape · photo: Matthew Wiebe
- `https://picsum.photos/id/855/1600/1000` — Small figure walking past a huge bright yellow wall · light tone · bright yellow, black · calm area: left · native landscape · photo: Rodion Kutsaev
- `https://picsum.photos/id/693/1600/1000` — Red suspension bridge tower rising from fog above rugged cliffs · mid tone · rust red, grey, dark teal · calm area: left · native landscape · photo: Rob Bye
- `https://picsum.photos/id/1081/1600/1000` — Stepped white modern building corner rising into a pale blue sky · light tone · white, pale blue, soft grey · calm area: top · native landscape · photo: Julien Moreau
The last two path numbers are width and height: request the exact crop you render (`/1200/1500` for a 4:5 portrait, `/2400/1350` for a hero) and
add `?grayscale` to desaturate. Use three to six of them, not all eight. Always set `width`, `height`, `alt` and `loading="lazy"` (not on the hero image).
Other sets that fit this brief: object-still, fog-and-quiet, hands-and-making, people — `node draw.mjs --photos <set>` prints one in full; `--photos list` shows all sets. Taking photographs from another set is your call and is not a redraw; keep them to one light and one treatment.

## 6. Hero — Pinned title over portraits
A pale flat ground. The title runs on one line of extra-bold uppercase at clamp(90px, 10vw, 160px), centred, spanning about 82% of the width, its cap line 120px from the top. It lives in a sticky layer (`position: sticky; top: 0; height: 100svh`) stacked above the images and set in one saturated ink that reads on both ground and photograph. Beneath it a single portrait photograph, 2:3, sits centred on columns 5–8 (about 37% of the width) and runs from 90px below the top edge down to the bottom edge, so the title crosses its upper quarter and the middle letters sit on the image. The wordmark sits top-left at 24px in 15px bold; one 'Menu' word sits top-right. Bottom-left on columns 1–3: the supporting sentence as a narrow column at 16px bold, max 26ch, its last line 32px above the bottom edge. Bottom-right: the single action as a solid rectangular button. As the page scrolls, further portraits of identical ratio and position replace the first, five to eight in all, each bringing its own flat ground colour sampled from the photograph, before the layer releases.

On a phone: The title stays pinned at the top at 17vw on one line, or two lines at 15vw if longer than ten characters. Each portrait becomes full width minus 16px margins at 2:3 and starts behind the lower half of the title. The supporting sentence follows the first portrait at 16px. The action button is fixed to the bottom-right corner, 16px in. The wordmark shrinks to a monogram top-left.
Headline: The title of the series, or the name: one uppercase line of up to about 14 characters at 10vw, two short lines on a phone.

Adjusted for this page:
- It names a kind of typeface: use the dealt faces (display Cabinet Grotesk, text Cabinet Grotesk) and their settings; capitals only where the type system sets them.

## 7. Sections, in order
Each is a composition to rebuild with this project's content. Keep the geometry; change the subject. Re-order or drop a
section when the argument of the page needs it (see references/copy.md), never to fall back to a card grid.

### 1. work — Small index, large picture (pinned)
A sticky stage of 100svh split 38/62. The right 62%, from x 560 to the right viewport edge, is one photograph the full height of the stage, bleeding off the right, top and bottom edges, square corners: a staged picture of the current project in use, in a real place. The left column, from the 20px margin to x 520, holds the heading at the top, two lines at clamp(80px, 8.2vw, 120px), leading 0.95, 40px under the navigation; then empty ground; then, anchored to the bottom with a 32px margin, the index: three to six rows 44px tall, each with the project's name at 28px on the left and two or three disciplines at 16px right-aligned in the soft ink. The current row is in the full ink and the others at 40% opacity; rows are told apart by space only. Each project gets one viewport of scroll: as it arrives, its photograph wipes in from the bottom edge (`clip-path: inset(100% 0 0 0)` to `inset(0)` over 900ms) and the current row moves down the list. The empty middle of the left column is closed by the heading above it and the index below.
On a phone: The heading sits at the top at 14vw on two lines, then the photograph at full width at 4:5, sticky under the heading while the index rows below it change the picture; or let each project simply stack as photograph and row.

Adjusted for this page:
- It fades text: anything a visitor reads, inactive items of a list included, is `--ink` or `--muted` at full strength (contrast 4.5:1 or more). The active item is told apart by `--ink` against `--muted`, weight or the accent, not by fading the rest.

### 2. about — Pinned title, portraits pass (pinned)
A wrapper tall enough for its portraits: about 90svh per person, up to six people. A `position: sticky; top: 0` layer of 100svh holds the heading, two words at clamp(88px, 12vw, 180px), leading 0.85, centred at mid-height, in white with `mix-blend-mode: difference` so it reads over ground and photographs alike. Beneath it in the stacking order, portraits scroll past in normal flow: each a 4:5 photograph 26–30vw wide, alternately starting at column 2 and ending at column 11, 60svh apart, so each one passes behind a different half of the heading. Under each portrait's left corner: the name at 18px, the role at 14px in the soft ink, and one sentence of up to 30 words in a 280px measure. The last portrait is followed by 40svh of empty ground before the heading releases. Square corners. Nothing else is on screen.
On a phone: The heading shrinks to 17vw and pins 16px from the top instead of at mid-height. Portraits become 72% wide, alternating between the left and right margins, 48px apart, each with name, role and sentence beneath at the portrait's width.

Adjusted for this page:
- It names colours (white): map them onto this palette's roles (ground `--bg`, panels `--surface` and the fields, text `--ink`/`--muted`, the accent `--accent` on the primary action only).
- It blends text with `difference`: over anything but black, white or grey that gives random hues. Use a solid ink chosen for each ground instead.

### 3. contact — The email as display type (statement)
The section is 100svh in the inverse of the page's colours. A single email address is set as one line of display type spanning the content width: the font-size is fitted so the address runs from margin to margin (about 7–9vw for 20 characters; break after the @ onto two lines if it is longer than 26), light or regular weight, tight tracking, sitting on a baseline 12vh above the bottom edge. It is a `mailto:` link; on hover the whole line takes the accent ink. In the top-left corner, a sentence of up to 12 words at 20–22px says what to write about. In the two bottom corners at 14px: phone and city at the left, two or three social links at the right. No heading and no form. For a pinned ending, make the section `position: sticky; bottom: 0` beneath the page so the previous section lifts off it.
On a phone: The address breaks after the @ onto two lines at 11.5vw, left-aligned, sitting at 55% of an 86svh screen. The sentence sits at the top-left at 18px. Phone, city and social links stack at the bottom-left at 15px with 12px between them.

### 4. footer — Name first, places under it (list)
The wordmark opens the footer instead of closing it. On a full-bleed field in the page's inverse or final chapter colour, the name spans the full content width as the first thing, its cap line pushed 8% above the footer's top edge so the tops of the letters are sliced off by the section (`overflow: hidden` and a negative top margin in `em`). 72px beneath, a two-part row: columns 1–5 list the places or ways to reach the studio (cities, or email and telephone), one per line at 32–36px in the accent ink, each a link; columns 7–12 hold three columns of small links at 15px, top-aligned with the first place. A final row 96px lower carries the legal line at the left and a back-to-top text link at the right, both 13px. The field is about 90svh tall, and nothing sits between the wordmark and the row but space.
On a phone: The sliced wordmark stays at the top, fitted to the width. Places follow as a list at 26px, then the link columns two across at 15px. Legal line and back-to-top link share the last row at 12px, at opposite margins.

Adjusted for this page:
- It sets text at 12px: use your small step (13px or more) instead.
- It crops letters along their top: the inspector fails that (jurors read it as broken). Crop at the bottom edge or a side instead.

## 8. Motion — Pinned story
One element holds its place with `position: sticky` (a title, a frame, a product fragment) while the items that belong to it scroll past or swap inside it. The page's ordinary scrolling does the work; nothing is hijacked. Hold it for about one screen per step and three screens at most, two held stages per page at most, with a line of text on every held screen. Recipe: 'Pinned story' in references/motion.md.
This is the signature move, the one loud moment. Around it the page still needs the rest of the motion layer (SKILL.md step 9): an entrance for the parts of every section, feedback on every control, and one moving picture. The inspector fails a page that barely moves. Recipes: references/motion.md.

## 10. Where the richness comes from
Repetition with change. The fixed title makes each new photograph feel like an event, so the photographs must be good and consistent.

## 11. How this direction goes wrong
If the title is not legible over every panel, the idea fails: test each one. Keep the pinned run under six viewports or it feels like a trap. On a phone the title shrinks to 16–18vw and stays pinned at the top; panels become full-width. A pin longer than three screens, or one where the screens under it are nearly empty, read in blind tests as a stuck page. Every screen under the pin needs its own content, and nothing may pass over the pinned words.

## 12. Real references
Studied sites that work this way. Take the principle, never the specifics: no names, copy, images or signature assets of theirs.
- **NORMAL IS BORING** (Awwwards Site of the Day, studied score 7.3) `aww-normal-is-boring`
  Idea: The brand name is split and half of it turned upside down: a plain sans first word top-left and a serif last word flipped 180 degrees bottom-right stay fixed while panels slide sideways between them.
  Hero: A white panel fills the left 80%; a full-height interior photo takes the right 20%. Top-left: the first word of the name in light geometric capitals, about 56px. Bottom-right of the white panel: an italic 'is' above the last word in bold didone, rotated 180 degrees so it reads upside down. Three small caps nav links run vertically up the panel's right edge. The 50px headline is broken into three two-line fragments on different columns and baselines: one at 21% from the left, one a line lower at 42%, one back at 21% whose last word turns bold italic didone. A seven-line 13px paragraph hangs beneath the middle fragment.
  Worth taking: Split a two-part brand name into opposite corners of the viewport and flip one half 180 degrees so the logo enacts the name.
- **Glitch&Grit** (Awwwards Site of the Day, studied score 7.5) `aww-glitch-grit`
  Idea: Every screen is one project: two half-width footage columns with the project name stacked dead centre across their seam in a single flat pastel that changes per project.
  Hero: Black viewport split down its vertical centre. The left half holds a huge flat grey flower silhouette bleeding off the left and bottom edges; the right half is black with a few tiny video thumbnails drifting through. Dead centre, straddling the split, sits a two-line uppercase title in mint green, about 11vw per line, lines almost touching, spanning roughly 70% of the width. Two tiny category lines sit directly above it and a tiny 'view full project' link directly below, all in the same green. Navigation is six small bold white words pinned to the frame: three links across the top edge, the three-part studio name across the bottom edge.
  Worth taking: Break the studio name into three words pinned bottom-left, bottom-centre and bottom-right, mirroring three nav links across the top, so the viewport frame itself is the logo.
- **HAOQI.DESIGN** (Awwwards Site of the Day, studied score 7.6) `aww-haoqi-design`
  Idea: A design engineer's page built like an instrumented canvas: visible construction grid with crosshairs, live coordinates and clock, and a glossy 3D greeting that plays with the cursor.
  Hero: Deep cobalt field with soft darker diagonal blurs. Faint guide lines divide the screen into three columns and three rows, with small plus marks at intersections. Top row: wordmark left, four mono nav items right. Second row: a two-line role title left, a two-line mono motto centre, a four-line mono bio right. Centre: glossy inflated 3D script reading hello, about 60% of viewport width, with a 3D cursor arrow lower right. The headline, three uppercase lines of wide bold sans at 5.6vw, is flush left in the lower third and tucks under the lettering. Bottom edge: mono time and weather left, cursor coordinates centre, globe icon right.
  Worth taking: Leave the layout grid visible as hairlines with plus marks at intersections and snap every block to it, so the scaffolding becomes the ornament.
Full notes on any of them: `node draw.mjs --site <id>`.

## Always
Headlines two lines or fewer at every width. No eyebrow labels, no monospace, no 01/02/03, no thin rules, no gradients, no shadows at rest,
no cream-and-terracotta, no violet. The frame: one h1 on the first screen that says what this is, equal outer margins, no
section huddled on one side with the other half empty, no blank stretch over half a screen, a heading on every section.
`inspect.mjs` measures all of it.

Saved to C:/Users/User/.t3/worktrees/portfolio/t3-53ccf175/.taste-skill/pinned-poster/direction.json · reprint with `node draw.mjs --show`
