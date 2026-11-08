# DIRECTION SHEET — The quiet instrument
seed 188588077 · drawn 2026-11-08 · sector personal-portfolio
Brief: Lilian PRIEU, software engineer: video games (Lysandra), player tools (Huzounet) and a Unity visual scripting kernel (Atelier)

| | |
| --- | --- |
| Direction | The quiet instrument |
| Hero | Navigation on the midline |
| Type | League Spartan / Figtree |
| Colour | Frost and slate |
| Sections | work (Quiet ledger, side preview) → about (Founder's letter) → contact (Sentence, portrait, two links) → footer (A single quiet line) |
| Motion | Slow crossfade |
| Photographs | the "Objects" set, as atmosphere |

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
Radical understatement. Where every competitor shouts, this page almost whispers: a headline barely larger than body text, a narrow column, small exact demonstrations, and a great deal of untouched space. The restraint is the claim. It says the thing is simple, finished and sure of itself. This only works when it is carried through completely; one loud element breaks it. In the study, a tool for simple lists sold itself with a 27px headline and 12–14px copy and was one of the most confident pages in the set.

Before anything else, write one sentence in your notes: "On this page, <the subject's own material> becomes <the device>."
Fill the first blank from your inventory of what only this client has (its name and what it means, its street, its numbers, its
constraint), then put the nearest competitor in the sentence: if it still works, the idea is the category's, not the client's.
Then name the one live thing the visitor can do on the page (SKILL.md step 4).

## 2. Composition
A single column 440–560px wide, placed left of centre (starting at about 22% of the viewport width) or dead centre, running the whole page. The headline is the one large thing on the first screen: two lines at display size (5–7vw), medium weight, starting on the column's left edge and allowed to run wider than the column. The supporting paragraph follows at body size (17–19px) in the full ink. One small primary button and one text link. Below, each point is a short paragraph followed by a compact demonstration or image no wider than the column. Sections are separated only by space (96–140px). Nothing spans the full width until the footer, which is a single quiet line. The first screen is mostly empty and that emptiness is composed: the column's top edge sits at about 30% of the viewport height.

## 3. Type — League Spartan / Figtree
A compact bold geometric with a low waist, punchy in short lowercase lines, over a friendly open text sans. Suits newsletters, consumer products, creators and small shops.
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700&family=Figtree:wght@400;600&display=swap" rel="stylesheet">
```
- Display: **League Spartan** — weight 700 · tracking -0.04em · leading 0.88 · lowercase or sentence case
- Text: **Figtree** — 400 for body, 600 for emphasis · leading 1.5 · tracking 0
```css
:root {
  --step-small: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem);
  --step-body: clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);
  --step-lead: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);
  --step-head: clamp(2rem, 1.3rem + 3.2vw, 4rem);
}
```
One family, two weights. A display size for the headline (5–7vw), one heading size for section titles (about 32–40px), body at 17–19px, a small size for captions (14–15px). Leading 1.5 for text. Letter-spacing near zero. The typeface must be handsome at small sizes.
The direction decides sizes and how many of them; the type system decides how this face is set. Where the two give different tracking or leading, use the values of the type system: they are tuned to this face.
The display size itself comes from the hero blueprint below.

## 4. Colour — Frost and slate
```css
:root {
  --bg: #f7f9fa;
  --surface: #ecf0f2;
  --ink: #1f3038;
  --muted: #5d6b72;
  --accent: #0d7480;
  --accent-ink: #ffffff;
}
```
Cool white and one paler blue-grey step hold everything, with type in dark slate instead of black. Teal appears once per screen at most, as the primary button or one small detail beside the product photograph.
Paper and two inks (full and soft). One accent used on exactly one element per screen.

## 5. Imagery
**The project has no photographs of its own yet.** First choice: **real pictures of the subject's world from the open collections**: its city and street in old postcards and photographs, an old map of the neighbourhood, its materials up close, its trade in engravings, museum objects of its kind (references/imagery.md §3). Start with `node C:/Users/User/.t3/worktrees/portfolio/t3-53ccf175/.agents/skills/design-taste-frontend/scripts/assets.mjs "scripting kernel"`, then queries from your inventory (its street, its materials, its trade's tools and history). Download what you use into the project with `--get` and credit every one on the page (`--credits` prints the footer line). They show the world around the client, never the client's own room, dish, product, person or team. Second, for what no honest picture exists of: draw the subject's own things in code, large, in one flat graphic language and the palette's real colours (its tiles, its windows, its objects; references/imagery.md §8). Third: the dealt photographs, only where an honestly generic picture fits (the sea, the weather, a material), never one a visitor could take for the thing itself and never an unrelated scene. One treatment for all of them. If this direction is built on photographs, plan the set before building (four to six pictures of one family) and reuse them at different crops and scales instead of finding or drawing a new picture for every slot; keep drawings as `<symbol>` + `<use>` or generate them with a small script so the page stays light. List every found picture (with its source and licence), every dealt photograph and every drawing that stands in for photography in your report.

Precise rather than loud: cropped interface details at true size, and real photographs of the customer's world held to the column width, each doing one job. One short looping clip can sit at column width too. Never a large stock hero image.

**Floor (the inspector checks it):** at least four real pictures on the page, usually six to twelve; SVG drawings do not count. One moving picture where an honest clip exists: `node <skill>/scripts/assets.mjs --video "<query>"`, used as a muted loop with a poster frame. Whatever this direction says about pictures, it is carried out with real ones.

Photographs dealt for this build, from the "Objects" set (single objects seen close: instruments, tools, cameras, books)
Order of preference for imagery: (1) the project's own photographs and product shots; (2) images you generate, if an image tool is
available; (3) real pictures of the subject's world found in the open collections (assets.mjs, downloaded and credited on the page);
(4) drawings of the subject in code; (5) these. They are real photographs (Unsplash licence, served by picsum.photos) of places, light and
texture. They are atmosphere, never a stand-in for a specific product, dish, person or interface. List the ones you use in your report so
they can be replaced.
- `https://picsum.photos/id/63/1600/1000` — Cup of coffee seen from above on a bright red surface · mid tone · bright red, white, brown · calm area: right · native landscape · photo: Justin Leibow
- `https://picsum.photos/id/486/1600/1000` — Black vintage typewriter with blank paper seen from above on white · light tone · white, black · calm area: left · native portrait · photo: Florian Klauer
- `https://picsum.photos/id/175/1600/1000` — Close-up of an analogue clock face in black and white · mid tone · white, black, grey · black-and-white · native landscape · photo: petradr
- `https://picsum.photos/id/535/1600/1000` — Colourful shirts on wooden hangers along a metal pipe rail · dark tone · charcoal, orange, green · native portrait · photo: Jeff Sheldon
- `https://picsum.photos/id/23/1600/1000` — Close-up of metal fork tines against a dark blurred background · dark tone · charcoal, blue grey, silver · calm area: top · native portrait · photo: Alejandro Escamilla
- `https://picsum.photos/id/24/1600/1000` — Open book lying on a wooden table in soft light · light tone · cream, warm brown · calm area: top · native landscape · photo: Alejandro Escamilla
- `https://picsum.photos/id/113/1600/1000` — Steam rising from a metal mug with blurred blue background · mid tone · steel blue, white, grey · calm area: top · native landscape · photo: Zugr
- `https://picsum.photos/id/39/1600/1000` — Close-up of a turntable tonearm resting on a vinyl record · light tone · white, black, warm grey · calm area: top · native landscape · photo: Luke Chesser
The last two path numbers are width and height: request the exact crop you render (`/1200/1500` for a 4:5 portrait, `/2400/1350` for a hero) and
add `?grayscale` to desaturate. Use three to six of them, not all eight. Always set `width`, `height`, `alt` and `loading="lazy"` (not on the hero image).
Other sets that fit this brief: architecture, fog-and-quiet, hands-and-making, people — `node draw.mjs --photos <set>` prints one in full; `--photos list` shows all sets. Taking photographs from another set is your call and is not a redraw; keep them to one light and one treatment.

## 6. Hero — Navigation on the midline
One photograph or muted film fills the viewport at 100vw by 100svh, `object-fit: cover`, framed so the middle of the screen cuts the subject: a face or a skyline in the upper half, hands or ground in the lower. There is no headline block and nothing in the top or bottom bands. One rail 64px tall runs across the exact vertical centre (its top at 418px) and carries everything on one baseline in the paper colour: the `h1` on the 24px left margin, the name with what it is in two to five words at clamp(32px, 2.6vw, 40px) in medium weight, doing the job of the wordmark; from column 6, one supporting sentence at 18px, max 44ch; at the right margin, two text links at 15px and the single action as a small solid button in the paper colour. If the frame is light behind the rail, give the rail alone a neutral dark scrim at 35%. The rail is `position: sticky; top: 0` in the hero's flow, so as the page scrolls it rises with the content and docks as the header bar without changing size or layout, taking the page ground once the pictures have passed. A second full-bleed photograph, a closer detail of the same subject, follows directly beneath, so the rail is seen crossing two pictures before it reaches the top. On a black ground with one photographed object instead of a film, stand the object on the rail at about 17% of the width, between the sentence and the links, so the line seems to pass behind it.

On a phone: A portrait crop keeps the subject's middle on the screen's middle. The rail stays on the vertical centre, as tall as the `h1` needs at 28px on up to two lines, with the `h1` on the left and Menu on the right. The sentence leaves the rail and sits at 17px in the bottom-left on a 20px margin with the action as a full-width button under it, over a neutral scrim limited to that corner. The rail docks at the top as on desktop.
Headline: The `h1` on the rail: the name with what it is, two to five words at 32–40px on one line, and one sentence of up to 50 characters beside it; the picture does the rest.

Adjusted for this page:
- It names colours (black): map them onto this palette's roles (ground `--bg`, panels `--surface` and the fields, text `--ink`/`--muted`, the accent `--accent` on the primary action only).

## 7. Sections, in order
Each is a composition to rebuild with this project's content. Keep the geometry; change the subject. Re-order or drop a
section when the argument of the page needs it (see references/copy.md), never to fall back to a card grid.

### 1. work — Quiet ledger, side preview (list)
A plain ledger in one column 560px wide whose left edge sits at 22% of the viewport width. A heading of two or three words at 24–28px in medium weight, then 32px of space, then one row per project, 44px tall: the name at 16px in full ink at the left, the kind of work at 14px in the soft ink starting at 55% of the column, and the year right-aligned with tabular figures. Nothing is drawn between rows; the three fixed starts make the columns. Hovering or focusing a row keeps it in full ink, drops the others to the soft ink, and shows that project's image in the empty area right of the column: a 4:3 frame 300px wide, `position: absolute`, its top aligned to the hovered row, 64px from the column's right edge, appearing with a 150ms fade. Holds 6–20 rows; group by year with 28px of extra space.
On a phone: The column fills the width with 20px margins. Rows are 52px tall: name at the left, year at the right, kind of work on a second line at 13px. There is no hover preview; instead the first three projects each show a 16:10 image at full column width above their row.

### 2. about — Founder's letter (stack)
A letter in a centred column 520px wide with at least 160px of empty ground above and below. At the column's top-left, a round portrait 44px across. 28px below it, four or five short paragraphs at 16–17px with leading 1.55, each two to four lines and separated by one blank line, written in the first person. No heading. The sign-off is the writer's name at 22px in the text face's italic, with the role at 14px in the soft ink beneath it. One phrase in the letter may carry a flat marker-colour background. Variant for a page built as an object: the letter sits on a filled paper-colour sheet 640px wide with 60px padding on a contrasting ground, square corners, its bottom edge cut into small scallops with `clip-path`, and below a row of 5px round dots a tear-off strip 72px tall that carries the email address.
On a phone: The column takes the full width with 24px margins; text at 16px, portrait 40px. In the sheet variant the sheet spans edge to edge with 24px padding and keeps its shaped bottom edge; the tear-off strip stacks the email above a full-width button.

Adjusted for this page:
- It names a kind of typeface: use the dealt faces (display League Spartan, text Figtree) and their settings; capitals only where the type system sets them.

### 3. contact — Sentence, portrait, two links (band)
One closing row of three elements hanging from the same top line, with open ground between them, on a 12-column grid. Columns 1–5: a sentence of 12–18 words at clamp(26px, 3vw, 44px), four lines, leading 1.1, saying what kind of enquiries are welcome; it is set as a paragraph and there is no separate heading. Columns 8–9: one small square portrait or photograph of the place, 150–170px, with square corners. Columns 10–12: a short question at 18px in medium weight, then 20px below it two underlined links stacked at 18px (the email address and one booking or social link), and beneath them a line at 14px in the soft ink with the city and the usual reply time. Columns 6–7 stay empty. The row has 160px of space above and 120px below. No form. On a dark ground the photograph is the only bright thing in the row.
On a phone: The sentence comes first at 7.4vw. Below it the portrait at 96px square sits at the left margin with the question and the two links to its right, top-aligned, in the remaining width. The city and reply-time line spans the full width beneath.

Adjusted for this page:
- It sets a sentence large over several lines: jurors read that as a long headline. Either cut it to a two-line headline at display size, or keep it a statement at 36px or less on three lines (24px, four lines on a phone).

### 4. footer — A single quiet line (strip)
No footer block at all. After at least 30svh of empty page ground, one baseline 30px above the bottom edge carries three items in the page's ordinary small text size (14–16px), the same size and weight as the navigation: at the left margin, what this is in three or four words; centred, two to five links separated by 24px of space; at the right margin, the year and a privacy link. Use a three-column grid (1fr auto 1fr) so the centre group is truly centred whatever the side lengths. No logo, no background change, no line above it, no columns. Links are in the full ink; the rest in the softer ink. If the page has a narrow text column, the three items may instead sit on that column's left edge as one wrapped line. The restraint only works if the page above has already made its invitation.
On a phone: Three short lines at 14px on the left margin with 8px between them: the description, the links on one wrapped line, then year and privacy. Links stay in the full ink. Leave 20svh of empty ground above and 24px below.

## 8. Motion — Slow crossfade
The principal photograph quietly changes: three or four images of the same framing crossfade over about 1.6 seconds, holding five to six seconds each, or the fixed image changes when its matching section arrives. It should feel like light shifting in a room. Pause when the tab is hidden; under reduced motion show only the first image.
This is the signature move, the one loud moment. Around it the page still needs the rest of the motion layer (SKILL.md step 9): an entrance for the parts of every section, feedback on every control, and one moving picture. The inspector fails a page that barely moves. Recipes: references/motion.md.

## 10. Where the richness comes from
Precision. With so little on the page, alignment, spacing and the exact size relationships are the design. Every element shares the column's left edge.

## 11. How this direction goes wrong
This is the one direction where a small headline is right; the inspector will not object, but do not mix it with a large display line. Emptiness must look decided: keep the column edges exact and the vertical rhythm even. Not suitable when the subject needs emotion or photography to sell. Quiet is not thin: the column must still deliver every piece of content the brief asks for, in full, at 16px or more in the full ink. In blind tests the quiet version lost every time it was quiet everywhere: a small headline beside an empty panel read as unfinished. Quiet means few things, not small things: the headline and the demonstration are large, and every screen holds content.

## 12. Real references
Studied sites that work this way. Take the principle, never the specifics: no names, copy, images or signature assets of theirs.
- **Cursor Compile** (One Page Love, studied score 8.3) `opl-compile`
  Idea: The event name drawn as seven looping one-line curves in seven colours, more signature than logotype, on an otherwise whisper-quiet off-white page whose images are re-rendered as rows of coloured characters.
  Hero: Warm off-white field with no header or navigation. Starting about 23% down, a line-drawn wordmark spans from 8% to 92% of the width and about 29% of the height: each letter is a single 2px stroke looping like a Lissajous figure, each in a different colour (orange, green, olive, lilac, black, brown, blue), overlapping its neighbours. Directly beneath, two 14px captions, one flush left in ink and one flush right in grey. After a gap of about 20% of the viewport, three equal columns sit at the bottom, each topped by a hairline: an 18px statement, a grey 14px paragraph, and an email field over a full-width near-black rectangular button.
  Worth taking: Draw the name as one continuous thin looping stroke per letter, each in a different colour, and let it be the only large element on the page.
- **Rows** (One Page Love, studied score 7.5) `opl-rows`
  Idea: Radical understatement: a product about simple lists is sold with a 27px headline, 12px copy and a column of small live demos, each proving one interaction.
  Hero: Warm off-white page, almost empty. Everything hangs on one vertical line 27% in from the left. A small striped-letter logo mark sits there near the top; 220px lower comes a two-line headline at only 27px (under 2vw), then three lines of 13px body about 370px wide, then a near-black rectangular button with 4px corners beside a text link with an arrow. A single grey sign-in link sits in the top-right corner; there is no navigation bar. More than 80% of the viewport is blank. At the bottom edge the first feature module peeks in: grey demo panel left, short text column right.
  Worth taking: Set the headline at near-body size (under 2vw) and let empty space, not scale, give it importance.
- **Jesper Landberg** (Awwwards Site of the Day, studied score 7.5) `aww-jesper-landberg-4`
  Idea: Project screenshots become bent, rippling panels on a horizontal WebGL strip floating above a perspective grid floor in the dark.
  Hero: Black viewport. Four tiny bold uppercase labels sit in the corners with 77px side and 44px vertical margins: name top-left, profile top-right, a view toggle bottom-left, newsletter bottom-right. Across the middle runs a horizontal strip of project panels rendered in WebGL: the centre panel is about 47% of the viewport wide and 52% tall with rounded corners, its top and bottom edges rippling as if the sheet were flexing; neighbours are cropped by the screen edges and angled away. Each panel carries a white project title bottom-left and a round arrow button bottom-right. Below, a white-line perspective grid floor recedes to a dark horizon. The top quarter is empty.
  Worth taking: Reduce all chrome to four tiny uppercase labels pinned in the corners so the work fills the stage.
Full notes on any of them: `node draw.mjs --site <id>`.

## Always
Headlines two lines or fewer at every width. No eyebrow labels, no monospace, no 01/02/03, no thin rules, no gradients, no shadows at rest,
no cream-and-terracotta, no violet. The frame: one h1 on the first screen that says what this is, equal outer margins, no
section huddled on one side with the other half empty, no blank stretch over half a screen, a heading on every section.
`inspect.mjs` measures all of it.

Saved to C:/Users/User/.t3/worktrees/portfolio/t3-53ccf175/.taste-skill/quiet-instrument/direction.json · reprint with `node draw.mjs --show`
