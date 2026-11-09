import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { loaderPlayedKey, signalLoaderDone } from "../../lib/motion";
import { m } from "../../paraglide/messages.js";
import { nameMark } from "./lettering";
import { swollenName } from "./wave";

/*
 * The loading screen of the first page of a session: drops merging under a goo filter, the name's
 * lettering filling with a rising wave as the page really loads (fonts, then every resource)
 * while a swell runs through its letters, then a curtain that drains upward with its middle
 * lagging like a falling drop, an accent film trailing it. This is the only place the name is
 * shown large.
 *
 * The server renders it so it covers the page from the first paint. The stylesheet shows it only
 * with scripts, motion allowed, and on the session's first page (the head script marks the later
 * ones); a CSS timer hides it anyway if this component never runs.
 */

const WAVE_PERIOD = 250;

/** A horizontal sine-like wave, two periods wider than the text, filled down to y = 400. */
function wavePath(width: number, amplitude: number) {
  let d = `M ${-WAVE_PERIOD * 2} 0`;
  for (let x = -WAVE_PERIOD * 2; x < width + WAVE_PERIOD * 2; x += WAVE_PERIOD) {
    d += ` q ${WAVE_PERIOD / 4} ${-amplitude} ${WAVE_PERIOD / 2} 0 t ${WAVE_PERIOD / 2} 0`;
  }
  return `${d} V 400 H ${-WAVE_PERIOD * 2} Z`;
}

/** Fits the name's lettering into the 1000 × 200 box the wave fills. */
const scale = Math.min(1000 / nameMark.width, 200 / nameMark.height);
const fit = `translate(${((1000 - nameMark.width * scale) / 2).toFixed(1)} ${((200 - nameMark.height * scale) / 2).toFixed(1)}) scale(${scale.toFixed(4)})`;

const curtain = {
  full: "M 0 0 L 100 0 L 100 100 C 66 100 33 100 0 100 Z",
  drip: "M 0 0 L 100 0 L 100 52 C 70 82 30 82 0 52 Z",
  gone: "M 0 0 L 100 0 L 100 0 C 66 0 33 0 0 0 Z",
};

/** Drops orbiting the central one; their speeds and phases are set in global.css. */
const drops = [
  { r: 20, orbit: 52 },
  { r: 15, orbit: 70 },
  { r: 22, orbit: 46 },
  { r: 12, orbit: 80 },
];

export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el || getComputedStyle(el).display === "none") {
      signalLoaderDone();
      setDone(true);
      return;
    }
    const q = gsap.utils.selector(el);
    const counter = el.querySelector("[data-slot='loader-count']");
    const wave = el.querySelector("[data-slot='loader-wave']");
    if (!counter || !wave) {
      signalLoaderDone();
      return;
    }
    /** Takes the screen down for good; later full loads of the session skip it. */
    const finish = () => {
      try {
        sessionStorage.setItem(loaderPlayedKey, "1");
      } catch {
        // Storage can be refused (private mode); the loader then plays on every full load.
      }
      signalLoaderDone();
      setDone(true);
    };
    // The stylesheet's timer hid the screen because the page never finished loading in time.
    const onFailsafe = (e: AnimationEvent) => {
      if (e.target === el) finish();
    };
    el.addEventListener("animationend", onFailsafe);
    const shown = { value: 0 };
    let target = 0.15;

    const drift = gsap.to(wave, { x: WAVE_PERIOD, duration: 1.6, ease: "none", repeat: -1 });

    // A swell travels through the letters, left to right, for as long as the page loads.
    const names = q("[data-slot='loader-name']");
    const swell = { amount: 0, x: -400, phase: 0 };
    const sweep = gsap
      .timeline()
      .to(swell, { amount: 1, duration: 0.6, ease: "power2.out" })
      .fromTo(
        swell,
        { x: -400 },
        { x: nameMark.width + 400, duration: 2.2, ease: "sine.inOut", repeat: -1 },
        0,
      );
    const reshape = (_time: number, delta: number) => {
      swell.phase += delta * 0.004;
      const d = swollenName(swell);
      names.forEach((name) => name.setAttribute("d", d));
    };
    gsap.ticker.add(reshape);
    const render = () => {
      counter.textContent = String(Math.round(shown.value * 100)).padStart(3, "0");
      gsap.set(wave, { y: 190 - shown.value * 210 });
    };
    const follow = () =>
      gsap.to(shown, {
        value: target,
        duration: 0.9,
        ease: "power2.out",
        onUpdate: render,
        overwrite: true,
      });
    follow();

    const fontsReady = document.fonts.ready.then(() => {
      target = Math.max(target, 0.55);
      follow();
    });
    const loaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true }),
          );
    // Counted from the start of navigation, so a slow script start does not add to the wait.
    const minimum = new Promise((resolve) =>
      setTimeout(resolve, Math.max(0, 1400 - performance.now())),
    );

    let cancelled = false;
    let exit: gsap.core.Timeline | undefined;
    const stop = () => {
      drift.kill();
      sweep.kill();
      gsap.ticker.remove(reshape);
    };
    void Promise.all([fontsReady, loaded, minimum]).then(() => {
      if (cancelled) return;
      target = 1;
      const curtainPath = q("[data-slot='loader-curtain']");
      const film = q("[data-slot='loader-film']");
      exit = gsap
        .timeline({
          onComplete: () => {
            stop();
            finish();
          },
        })
        .to(shown, {
          value: 1,
          duration: 0.6,
          ease: "power2.inOut",
          onUpdate: render,
          // Replaces a fill still easing toward the fonts' share, which would end below 100 %.
          overwrite: true,
        })
        // The letters settle back into their drawn shape as the fill completes.
        .to(swell, { amount: 0, duration: 0.6, ease: "power2.inOut" }, "<")
        .to(
          q("[data-slot='loader-drops']"),
          { scale: 1.6, duration: 0.5, ease: "back.in(2)" },
          ">-0.1",
        )
        .to(
          q("[data-slot='loader-content'], [data-slot='loader-meta']"),
          { y: -40, opacity: 0, duration: 0.45, ease: "power2.in" },
          "<0.15",
        )
        .addLabel("drain", "<0.1")
        .to(curtainPath, { attr: { d: curtain.drip }, duration: 0.55, ease: "power2.in" }, "drain")
        .to(curtainPath, { attr: { d: curtain.gone }, duration: 0.6, ease: "power3.out" })
        // The film follows a beat behind, so only an accent rim shows under the curtain's edge.
        .to(film, { attr: { d: curtain.drip }, duration: 0.55, ease: "power2.in" }, "drain+=0.07")
        .to(film, { attr: { d: curtain.gone }, duration: 0.6, ease: "power3.out" }, "drain+=0.62");
    });

    return () => {
      cancelled = true;
      el.removeEventListener("animationend", onFailsafe);
      stop();
      exit?.kill();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={root} data-slot="loader" aria-hidden="true" className="fixed inset-0 z-100">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {/* Two layers drain one after the other: the ground first, then an accent film under it. */}
        <path data-slot="loader-film" d={curtain.full} className="fill-accent" />
        <path data-slot="loader-curtain" d={curtain.full} className="fill-ground" />
      </svg>
      <div
        data-slot="loader-content"
        className="relative flex h-full flex-col items-center justify-center gap-10 px-6"
      >
        <svg data-slot="loader-drops" viewBox="0 0 200 200" className="size-44 overflow-visible">
          <defs>
            <filter id="loader-goo" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="9" />
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
            </filter>
          </defs>
          <circle cx="100" cy="100" r="34" className="fill-accent" />
          {drops.map((drop) => (
            <g key={drop.orbit} data-orbit>
              <circle cx={100 + drop.orbit} cy="100" r={drop.r} className="fill-accent" />
            </g>
          ))}
        </svg>
        <svg viewBox="0 0 1000 200" className="w-full max-w-5xl overflow-visible">
          <defs>
            <clipPath id="loader-name">
              <path data-slot="loader-name" transform={fit} d={nameMark.d} />
            </clipPath>
          </defs>
          <path
            data-slot="loader-name"
            transform={fit}
            d={nameMark.d}
            fill="none"
            strokeOpacity="0.3"
            strokeWidth={1.5 / scale}
            className="stroke-ink"
          />
          <g clipPath="url(#loader-name)">
            <path
              data-slot="loader-wave"
              d={wavePath(1000, 16)}
              className="fill-ink"
              transform="translate(0 190)"
            />
          </g>
        </svg>
      </div>
      <p
        data-slot="loader-meta"
        className="absolute right-6 bottom-6 text-small text-ink/70 tabular-nums md:right-10 md:bottom-8"
      >
        <span data-slot="loader-count">000</span>
        {m.loader_percent_sign()}
      </p>
      <p
        data-slot="loader-meta"
        className="absolute bottom-6 left-6 text-small text-muted md:bottom-8 md:left-10"
      >
        {m.loader_label()}
      </p>
    </div>
  );
}
