// Runs the prototype's scenarios in headless Chrome and saves a screenshot at
// each step, so every state of the journey can be looked at.
// Usage: node prototype/tools/drive.mjs <scenario> [--width=1440] [--height=900] [--out=dir]
// Scenarios: stills, journey, direct, reduced, nojs, no3d
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { Browser, sleep } from "../../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs";

const args = Object.fromEntries(
  process.argv
    .slice(3)
    .map((a) => a.replace(/^--/, "").split("="))
    .map(([k, v]) => [k, v ?? true]),
);
const scenario = process.argv[2];
const base = args.base ?? "http://127.0.0.1:4317";
const width = Number(args.width ?? 1440);
const height = Number(args.height ?? 900);
const out = args.out ?? `.taste-skill/drive/${scenario}-${width}`;
mkdirSync(out, { recursive: true });

const browser = await Browser.launch({
  width,
  height,
  extraArgs: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  width,
  height,
  mobile: width < 600,
  dsf: 1,
  reducedMotion: scenario === "reduced",
});
const logs = [];
browser.on(page.sessionId, "Runtime.consoleAPICalled", (p) => {
  if (["error", "warning"].includes(p.type))
    logs.push(`${p.type}: ${p.args.map((a) => a.value ?? a.description).join(" ")}`.slice(0, 300));
});

let n = 0;
async function shot(name, path = join(out, `${String(++n).padStart(2, "0")}-${name}.jpg`)) {
  await page.screenshot({ path, quality: 80 });
  console.log("shot", path);
}
const click = (sel) =>
  page.eval(
    `(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) throw new Error(${JSON.stringify("missing " + sel)}); el.click(); })()`,
  );
const state = () =>
  page.eval(
    `({ path: location.pathname, mode: document.documentElement.dataset.mode, preview: document.querySelector('[data-slot=preview]').open, scene: document.querySelector('[data-slot=stage]').dataset.scene, history: history.length })`,
  );
async function waitTitle(text, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if ((await page.eval("document.title")) === text) return;
    await sleep(250);
  }
  throw new Error(`title never became ${text}`);
}
async function until(expr, ms = 60000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await page.eval(expr)) return;
    await sleep(200);
  }
  throw new Error(`timed out waiting for ${expr}`);
}
async function enterLoader(mid = true) {
  if (mid) {
    await sleep(900);
    await shot("loader-progress");
  }
  await until(
    `getComputedStyle(document.querySelector("[data-slot=loader-actions]")).visibility === "visible"`,
  );
  await sleep(500);
  await shot("loader-ready");
  await click('[data-action="enter-silent"]');
  await until(`document.querySelector("[data-slot=loader]").dataset.state === "hidden"`);
  await sleep(1500);
}

try {
  if (scenario === "stills") {
    await page.goto(`${base}/?capture=${args.capture ?? "room"}`, { settleMs: 500 });
    await waitTitle("ready");
    await sleep(2500);
    await page.screenshot({
      path: args.file,
      format: args.file.endsWith(".png") ? "png" : "jpeg",
      quality: 88,
    });
    console.log("saved", args.file);
  } else if (scenario === "journey" || scenario === "reduced" || scenario === "no3d") {
    await page.goto(`${base}/${scenario === "no3d" ? "?no3d" : ""}`, { settleMs: 200 });
    await enterLoader();
    await shot("home");
    console.log(await state());
    await page.eval("window.scrollTo(0, innerHeight * 1.2)");
    await sleep(1200);
    await shot("home-work");
    await page.eval("window.scrollTo(0, document.body.scrollHeight)");
    await sleep(1200);
    await shot("home-end");
    await page.eval("window.scrollTo(0, 0)");
    await sleep(400);
    await click(".hero__action");
    await sleep(600);
    await shot("stage-expanding");
    await sleep(1800);
    await shot("headset-coming-down");
    await sleep(3800);
    await shot("gallery");
    console.log(await state());
    await click('[data-action="next"]');
    await sleep(1600);
    await shot("gallery-next");
    await click('[data-action="open-focused"]');
    await sleep(900);
    await shot("preview");
    console.log(await state());
    await page.eval("history.back()");
    await sleep(900);
    console.log("after back 1", await state());
    await page.eval("history.back()");
    await sleep(1400);
    await shot("headset-lifting");
    await sleep(3600);
    await shot("home-again");
    console.log("after back 2", await state());
    await click('[commandfor="about"]');
    await sleep(600);
    await shot("about");
  } else if (scenario === "direct") {
    await page.goto(`${base}/projets/huzounet/`, { settleMs: 200 });
    await enterLoader(false);
    await sleep(800);
    await shot("direct-preview");
    console.log(await state());
    await page.eval("history.back()");
    await sleep(1200);
    await shot("direct-gallery");
    console.log("after back 1", await state());
    await page.eval("history.back()");
    await sleep(4500);
    await shot("direct-home");
    console.log("after back 2", await state());
  } else if (scenario === "nojs") {
    await page.send("Emulation.setScriptExecutionDisabled", { value: true });
    await page.goto(`${base}/`, { settleMs: 1500 });
    await page.screenshot({ path: join(out, "nojs-full.jpg"), quality: 70, fullPage: true });
    console.log("shot", join(out, "nojs-full.jpg"));
  }
  console.log(
    "console:",
    logs.length ? logs.join("\n") : "clean",
    page.consoleErrors.length ? page.consoleErrors : "",
  );
} finally {
  await browser.close();
}
