import { gsap } from "gsap";
import { copy, projects } from "./content.js";
import { createAudio } from "./audio.js";

const root = document.documentElement;
const $ = (slot) => document.querySelector(`[data-slot="${slot}"]`);
const params = new URLSearchParams(location.search);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const lowPower =
  matchMedia("(max-width: 899px)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;
const capture = params.get("capture");

/* Locale and routes: /, /projets/, /projets/<slug>/, and the same under /en/. */

const locale = location.pathname.startsWith("/en/") ? "en" : "fr";
const t = (key) => copy[locale][key] ?? copy.fr[key];
const local = (value) => (typeof value === "string" ? value : value[locale]);
const prefix = locale === "en" ? "/en" : "";

function parse(pathname) {
  const path = pathname.replace(/^\/en(?=\/)/, "");
  const match = path.match(/^\/projets\/?(?:([a-z-]+)\/?)?$/);
  if (!match) return { view: "home" };
  const index = projects.findIndex((p) => p.slug === match[1]);
  if (match[1] && index >= 0) return { view: "preview", index };
  return { view: "gallery" };
}

function href(route) {
  if (route.view === "home") return `${prefix}/`;
  if (route.view === "gallery") return `${prefix}/projets/`;
  return `${prefix}/projets/${projects[route.index].slug}/`;
}

function translate() {
  if (locale === "fr") return;
  root.lang = "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll("[data-slug]").forEach((row) => {
    const p = projects.find((x) => x.slug === row.dataset.slug);
    row.href = `/en/projets/${p.slug}/`;
    row.querySelector(".work__kind").textContent = local(p.kind);
    row.querySelector("img").alt = local(p.imageAlt);
  });
  document
    .querySelectorAll('a[href^="/projets/#"]')
    .forEach((a) => (a.href = "/en/projets/#projets"));
  $("still").alt =
    "The room at night: a boy sits at his desk in front of the screen, a virtual reality headset beside the keyboard, the blue light of the city coming through the blinds.";
  $("about-text").innerHTML = `
    <p>I'm Lilian PRIEU, a software engineer. I program video games and the tools used to make them: game engines, websites, extensions, small programs that save time.</p>
    <p>Paragraph to write: background, studies, jobs and teams.</p>
    <p>I work with AI agents every day. I write their rules and skills, and publish the ones useful to others in <a class="link" href="https://github.com/Firzus/agent-skills">firzus/agent-skills</a>.</p>
    <p>Paragraph to write: what agents change in the way I work, with an example anyone can check.</p>`;
}

function updateLanguageLink(route) {
  const link = $("lang");
  const other = locale === "fr" ? "/en" : "";
  link.href = other + href(route).replace(/^\/en/, "");
  link.hreflang = link.lang = locale === "fr" ? "en" : "fr";
}

/* State shared by the transitions. */

const audio = createAudio();
let world = null;
let mode = "room";
let focus = 0;
let previewIndex = -1;
let queue = Promise.resolve();

const stage = $("stage");
const still = $("still");
const visor = $("visor");
const gallery = $("gallery");
const column = $("column");
const preview = $("preview");

function setMode(next) {
  mode = next;
  root.dataset.mode = next;
  const inGallery = next === "gallery";
  gallery.inert = !inGallery;
  for (const el of [column, $("bar"), $("footer")]) el.inert = inGallery;
  if (!world) still.src = inGallery ? projects[focus].image : "/assets/room.jpg";
  if (inGallery) window.scrollTo(0, 0);
}

function closeVisor(duration = 0.28) {
  const spans = visor.children;
  if (reduced) {
    gsap.set(spans, { scaleY: 1 });
    return gsap.fromTo(visor, { opacity: 0 }, { opacity: 1, duration: 0.35 }).then();
  }
  gsap.set(visor, { opacity: 1 });
  return gsap.to(spans, { scaleY: 1, duration, ease: "power3.in" }).then();
}

function openVisor(duration = 0.6) {
  const spans = visor.children;
  if (reduced)
    return gsap
      .to(visor, { opacity: 0, duration: 0.45 })
      .then(() => gsap.set(spans, { scaleY: 0 }));
  return gsap.to(spans, { scaleY: 0, duration, ease: "power3.out" }).then();
}

const chrome = () => [column, $("bar"), $("footer")];

/** The stage leaves its half of the screen and takes the whole viewport. */
async function expandStage() {
  if (reduced) return;
  const from = stage.getBoundingClientRect();
  root.dataset.mode = "immersive";
  gsap.to(chrome(), { opacity: 0, duration: 0.5, ease: "power2.out" });
  await gsap
    .fromTo(
      stage,
      { top: from.top, left: from.left, width: from.width, height: from.height },
      {
        top: 0,
        left: 0,
        width: innerWidth,
        height: innerHeight,
        duration: 0.9,
        ease: "power3.inOut",
        clearProps: "top,left,width,height",
      },
    )
    .then();
}

/** The stage shrinks back to its half while the column returns. */
async function collapseStage() {
  if (reduced) {
    gsap.set(chrome(), { clearProps: "opacity" });
    return;
  }
  root.dataset.mode = "room";
  const to = stage.getBoundingClientRect();
  root.dataset.mode = "immersive";
  gsap.to(chrome(), {
    opacity: 1,
    duration: 0.6,
    delay: 0.4,
    ease: "power2.out",
    clearProps: "opacity",
  });
  await gsap
    .fromTo(
      stage,
      { top: 0, left: 0, width: innerWidth, height: innerHeight },
      {
        top: to.top,
        left: to.left,
        width: to.width,
        height: to.height,
        duration: 0.9,
        ease: "power3.inOut",
      },
    )
    .then();
  root.dataset.mode = "room";
  gsap.set(stage, { clearProps: "top,left,width,height" });
}

async function headsetOn(index) {
  focus = index;
  audio.headsetOn();
  await expandStage();
  if (world && !reduced) await world.putOn();
  await closeVisor();
  setMode("gallery");
  renderGallery();
  audio.world(true);
  if (world && !reduced) {
    const fly = world.enterGallery(index);
    await openVisor();
    await fly;
  } else {
    world?.show("gallery", index);
    await openVisor();
  }
  gallery.focus({ preventScroll: true });
}

async function headsetOff() {
  audio.headsetOff();
  audio.world(false);
  await closeVisor();
  setMode("room");
  if (!reduced) root.dataset.mode = "immersive";
  if (world && !reduced) {
    const back = world.takeOff();
    await openVisor();
    await back;
  } else {
    world?.show("room");
    await openVisor();
  }
  await collapseStage();
  document.querySelector(".hero__action")?.focus({ preventScroll: true });
}

function renderGallery() {
  $("gallery-name").textContent = projects[focus].name;
  gallery
    .querySelectorAll("[data-index]")
    .forEach((b) => b.setAttribute("aria-current", String(+b.dataset.index === focus)));
  if (!world) still.src = projects[focus].image;
}

async function focusProject(index) {
  focus = (index + projects.length) % projects.length;
  audio.tick();
  renderGallery();
  if (world) await world.focusProject(focus, reduced);
}

function openPreview(index) {
  const p = projects[index];
  previewIndex = index;
  $("preview-title").textContent = p.name;
  $("preview-sentence").textContent = local(p.sentence);
  $("preview-role").textContent = local(p.role);
  const img = $("preview-image");
  img.src = p.image;
  img.alt = local(p.imageAlt);
  $("preview-links").innerHTML = p.links
    .map(
      (l) =>
        `<li><a class="link link--strong" href="${l.href}" target="_blank" rel="noopener">${local(l.label)}</a></li>`,
    )
    .join("");
  if (!preview.open) preview.showModal();
  audio.open();
  if (!reduced)
    gsap.fromTo(
      preview,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
    );
}

function closePreview() {
  previewIndex = -1;
  if (preview.open) preview.close();
}

/* Moves the page to a route, one transition at a time. */
function go(route) {
  queue = queue.then(async () => {
    updateLanguageLink(route);
    if (route.view === "home") {
      closePreview();
      if (mode === "gallery") await headsetOff();
      return;
    }
    const index = route.view === "preview" ? route.index : focus;
    if (route.view === "gallery") closePreview();
    if (mode === "room") await headsetOn(index);
    else if (index !== focus) await focusProject(index);
    if (route.view === "preview") openPreview(index);
  });
  return queue;
}

function navigate(route) {
  history.pushState({ app: true }, "", href(route));
  return go(route);
}

/** Leaves the current level the way the browser's Back button does. */
function back() {
  if (history.state?.app) history.back();
  else {
    const route = parse(location.pathname);
    const up = route.view === "preview" ? { view: "gallery" } : { view: "home" };
    history.replaceState({ app: true }, "", href(up));
    go(up);
  }
}

/* Controls. */

function bindControls() {
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "headset-on") {
      e.preventDefault();
      navigate({ view: "gallery" });
    } else if (action === "open-project") {
      e.preventDefault();
      const index = projects.findIndex((p) => p.slug === target.dataset.slug);
      history.pushState({ app: true }, "", href({ view: "gallery" }));
      focus = index;
      navigate({ view: "preview", index });
    } else if (action === "headset-off") back();
    else if (action === "close-preview") back();
    else if (action === "prev") focusProject(focus - 1);
    else if (action === "next") focusProject(focus + 1);
    else if (action === "open-focused") navigate({ view: "preview", index: focus });
    else if (action === "focus") focusProject(+target.dataset.index);
    else if (action === "sound") setSound(!audio.enabled);
  });

  preview.addEventListener("cancel", (e) => {
    e.preventDefault();
    back();
  });

  document.addEventListener("keydown", (e) => {
    if (mode !== "gallery" || preview.open) return;
    if (e.key === "ArrowRight") focusProject(focus + 1);
    if (e.key === "ArrowLeft") focusProject(focus - 1);
    if (e.key === "Escape") back();
  });

  // Browsers without invoker commands open the about panel from script.
  if (!("command" in HTMLButtonElement.prototype)) {
    document
      .querySelectorAll('[commandfor="about"]')
      .forEach((b) =>
        b.addEventListener("click", () => document.getElementById("about").showModal()),
      );
  }

  window.addEventListener("popstate", () => go(parse(location.pathname)));

  const list = $("gallery-list");
  list.innerHTML = projects
    .map(
      (p, i) =>
        `<li><button type="button" data-action="focus" data-index="${i}" aria-current="false">${p.name}</button></li>`,
    )
    .join("");
}

function setSound(on) {
  audio.setEnabled(on);
  sessionStorage.setItem("sound", on ? "on" : "off");
  const button = document.querySelector('[data-action="sound"]');
  button.setAttribute("aria-pressed", String(on));
  button.textContent = t(on ? "sound_on" : "sound_off");
}

/* The loader: at least two seconds, once per session, ends on the sound choice. */

function runLoader(progress) {
  const loader = $("loader");
  loader.dataset.state = "open";
  document.body.style.overflow = "hidden";
  const lines = loader.querySelectorAll('[data-slot="loader-line"]');
  const bar = $("loader-bar").firstElementChild;
  const percent = $("loader-percent");
  const shown = { value: 0 };
  const start = performance.now();
  if (!reduced) {
    gsap.from(lines[0], {
      yPercent: 60,
      opacity: 0,
      letterSpacing: "0.2em",
      duration: 1.4,
      ease: "power4.out",
    });
    gsap.from(lines[1], { yPercent: 80, opacity: 0, duration: 1, delay: 0.5, ease: "power3.out" });
  }
  return new Promise((resolve) => {
    const step = () => {
      const minimum = Math.min((performance.now() - start) / 2200, 1);
      const target = Math.min(progress(), minimum);
      shown.value += (target - shown.value) * 0.18;
      if (target >= 1 && shown.value > 0.995) shown.value = 1;
      bar.style.transform = `scaleX(${shown.value})`;
      percent.textContent = `${Math.round(shown.value * 100)} %`;
      if (shown.value < 1) return requestAnimationFrame(step);
      $("loader-status").textContent = t("loader_ready");
      gsap.to($("loader-bar"), { opacity: 0, duration: 0.3 });
      const actions = $("loader-actions");
      actions.style.visibility = "visible";
      gsap.to(actions, { opacity: 1, duration: 0.4 });
      actions.querySelector("button").focus();
      actions.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        setSound(b.dataset.action === "enter-sound");
        sessionStorage.setItem("visited", "1");
        gsap.to(loader, {
          opacity: 0,
          duration: reduced ? 0.3 : 0.7,
          onComplete() {
            loader.dataset.state = "hidden";
            document.body.style.overflow = "";
            resolve();
          },
        });
      });
    };
    step();
  });
}

/* Motion around the stage: section entrances and the scaling wordmark. */

function bindMotion() {
  if (reduced) return;
  const groups = [...document.querySelectorAll(".work, .contact")];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const parts = entry.target.querySelectorAll("h2, p, .work__item, img, .contact__links li");
        gsap.from(parts, {
          y: 24,
          opacity: 0,
          duration: 0.8,
          stagger: 0.07,
          ease: "power3.out",
          clearProps: "all",
        });
      }
    },
    { threshold: 0.15 },
  );
  groups.forEach((g) => observer.observe(g));

  gsap.from(".hero__lead, .hero__action, .hero__contact li, .hero__role", {
    y: 20,
    opacity: 0,
    duration: 0.9,
    stagger: 0.08,
    delay: 0.2,
    ease: "power3.out",
    clearProps: "all",
  });

  const name = document.querySelector(".hero__name");
  const footerName = document.querySelector(".footer__name");
  name.style.transformOrigin = "left bottom";
  footerName.style.transformOrigin = "left bottom";
  const onScroll = () => {
    const h = innerHeight;
    const leave = Math.min(Math.max(scrollY / h, 0), 1);
    name.style.transform = `scale(${1 - leave * 0.07})`;
    const r = footerName.getBoundingClientRect();
    const arrive = Math.min(Math.max((h - r.top) / r.height / 1.5, 0), 1);
    footerName.style.transform = `scale(${0.94 + arrive * 0.06})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* Start. */

async function startWorld(onProgress) {
  if (params.has("no3d")) throw new Error("3D disabled by ?no3d");
  const { createWorld } = await import("./scene.js");
  return createWorld($("canvas"), {
    images: projects.map((p) => p.image),
    reduced,
    lowPower,
    onProgress,
  });
}

async function boot() {
  translate();
  bindControls();
  const route = parse(location.pathname);
  updateLanguageLink(route);

  let loaded = 0;
  const worldReady = startWorld((p) => (loaded = Math.max(loaded, p)))
    .then((w) => {
      world = w;
      stage.dataset.scene = "live";
    })
    .catch((error) => {
      console.warn("3D unavailable, keeping the 2D version:", error);
      loaded = 1;
      stage.dataset.scene = "still";
    });

  if (capture) {
    root.classList.add("capture");
    await worldReady;
    if (capture === "desk") world?.frameDesk();
    if (capture.startsWith("gallery")) {
      setMode("gallery");
      world?.show("gallery", Number(capture.slice(7)) || 0);
    }
    document.title = "ready";
    return;
  }

  const firstVisit = !sessionStorage.getItem("visited") && params.get("intro") !== "skip";
  if (firstVisit) await runLoader(() => loaded);
  else {
    await worldReady;
    if (sessionStorage.getItem("sound") === "on") {
      addEventListener("pointerdown", () => setSound(true), { once: true });
    }
  }
  await worldReady;

  // A direct link to the gallery or a project opens it without the headset,
  // with the levels below it in the history so Back still climbs out.
  if (route.view !== "home") {
    focus = route.view === "preview" ? route.index : 0;
    history.replaceState({ app: true }, "", href({ view: "home" }));
    history.pushState({ app: true }, "", href({ view: "gallery" }));
    if (route.view === "preview") history.pushState({ app: true }, "", href(route));
    setMode("gallery");
    renderGallery();
    world?.show("gallery", focus);
    audio.world(true);
    if (route.view === "preview") openPreview(focus);
  } else {
    history.replaceState({ app: true }, "", location.pathname);
  }
  bindMotion();
}

boot();
