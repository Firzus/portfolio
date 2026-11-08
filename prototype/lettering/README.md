# Name lettering

The name on the loading screen is not set in a font. It is custom lettering:
an AI-generated bitmap, traced into one SVG path. This file records how it was made, so the
procedure can be repeated for another word or turned into a skill.

- `name-groovy.png`: the chosen source bitmap, 2172 × 724, light letters on a dark ground.
- `../scripts/trace-lettering.mjs`: traces a bitmap into `../src/pistes/d/name/lettering.ts`.
- `../src/pistes/d/name/wave.ts`: bends the path with a swell that runs through the letters.
- `../src/pistes/d/motion/Loader.tsx`: shows the name on the loading screen, the only place it
  appears large; the home page's hero leaves it out to stay light.

## Why this route

Earlier attempts failed in two ways. Free liquid fonts (Climate Crisis, Sour Gummy, Rubik Wet
Paint, Fredoka with an SVG goo filter) look generic or fray. Procedural lettering (round strokes
fused with a signed distance field) only yields tube letters: a generator can blend shapes but
does not design them. Generated lettering gives designed letterforms in minutes; a lettering
artist remains the better option when the result must be final.

## 1. Generate explorations

Generation runs through the Codex CLI and its built-in `image_gen` tool (the user's Codex
subscription; see the `imagegen` skill), one image per call, serially.

Two style references were attached with `-i`, used for mood and letter construction only: a
"JUICE" poster (white blobby fused letters on an orange blur) and the promotional image of the
Compoun Nomeros font (1970s groovy capitals). They are third-party images, so they are not kept
in the repository.

The prompt shared by every exploration, with `$brief` replaced per style:

```text
Call your built-in image_gen tool directly, exactly once. Do not open or follow any skill
(including any imagegen skill), and never run codex or any other program to generate the
image; the only shell command you may run is the copy at the end. Generate one image. Image 1
and Image 2 are style references only (mood and letter construction); do not copy their words,
colours or backgrounds.

Wide 3:1 landscape lettering artwork of a personal name wordmark for a portfolio hero. $brief
Exact text, spelled letter by letter: L-I-L-I-A-N, space, P-R-I-E-U. No other words, letters,
marks, shadows, gradients, textures or grain. Flat solid lavender-white letters (#ece9f5) on a
flat solid dark violet-black background (#0c0b14), crisp clean edges suitable for tracing into
a vector SVG. Centered, generous empty margin around the word. Original custom hand-lettering,
not an existing font.

Then copy the final image to <output path> in this directory and reply with that path.
```

The brief of the chosen exploration (number 1 of 6):

```text
Style: 1970s groovy psychedelic display lettering, all capitals LILIAN PRIEU on one line. Fat,
tall, slightly condensed letters whose stems bulge and pinch in a wavy rhythm, flared rounded
terminals, tiny counters, letters nearly touching, like Image 1.
```

The other five briefs asked for liquid fused letters (like JUICE), one wave through the whole
word, two stacked lines, a liquid high-contrast serif, and letters melting into puddles.

The call, with standard input closed:

```sh
codex exec --sandbox workspace-write -i ref-groovy.png -i ref-juice.png -- "<prompt>" < /dev/null
```

Pitfalls met:

- Without the first sentence of the prompt, Codex opened its own copy of the imagegen skill and
  called `codex exec` recursively instead of generating.
- Without `< /dev/null`, `codex exec` waits for more input on standard input and never starts.
- The model can misspell: spelling the text letter by letter helped, but check every result
  (one exploration drew the final U like a Y).

## 2. Choose

Compare the explorations side by side on the site's ground. Check the spelling letter by letter,
then readability at the hero's smallest size (about 270 px wide on a 390 px phone).

## 3. Trace

```sh
node scripts/trace-lettering.mjs lettering/name-groovy.png src/pistes/d/name/lettering.ts
```

The script runs potrace (a dev dependency; GPL, used as a tool only, so the traced path carries
no licence obligation) on light-on-dark input. It crops the path to the ink and writes width,
height and path data. The threshold defaults to 175, above mid-grey: at 128 the anti-aliased
slivers between touching letters count as ink and weld the letters together. Pass another
threshold as a third argument if a different bitmap needs it, and compare the trace with the
bitmap at 2× before keeping it.

## 4. Integrate

- The loading screen fits the path into its 1000 × 200 box with a translate and scale, draws it
  as a faint outline, and fills it with the rising liquid through a clip path.
- While the page loads, a swell travels through the letters (`name/wave.ts`), then eases out as
  the fill completes, so the name ends in its drawn shape. The swell moves the path's own
  points on each frame. An SVG displacement filter was tried first and dropped: it shifts
  pixels, so the edges lose their anti-aliasing and look pixelated.
- The page's `h1` keeps the name as screen-reader text before the visible title.
