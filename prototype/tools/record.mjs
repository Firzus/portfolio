// Films the whole journey in a visible Chrome window with FFmpeg (gfxcapture,
// Windows only): loader, home, headset on, gallery, preview, Back twice.
// Usage: node prototype/tools/record.mjs <out.mp4> [base url]
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  Browser,
  findChrome,
  sleep,
} from "../../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs";

const [out, base = "http://127.0.0.1:4317"] = process.argv.slice(2);
if (!out) throw new Error("usage: record.mjs <out.mp4> [base]");

const profile = mkdtempSync(join(tmpdir(), "fir417-rec-"));
const chrome = spawn(
  findChrome(),
  [
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--mute-audio",
    "--window-size=1456,1000",
    "--window-position=40,40",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
    "--app=about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);
const wsUrl = await new Promise((resolve, reject) => {
  let buf = "";
  const t = setTimeout(() => reject(new Error("Chrome did not start")), 20000);
  chrome.stderr.on("data", (d) => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) {
      clearTimeout(t);
      resolve(m[1]);
    }
  });
});

// Reuse the skill's CDP client on this headed instance.
const browser = Object.assign(Object.create(Browser.prototype), {
  nextId: 1,
  pending: new Map(),
  listeners: new Map(),
});
browser.ws = new WebSocket(wsUrl);
await new Promise((res) => (browser.ws.onopen = res));
browser.ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && browser.pending.has(msg.id)) {
    const { resolve, reject, timer } = browser.pending.get(msg.id);
    clearTimeout(timer);
    browser.pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    for (const fn of browser.listeners.get((msg.sessionId || "") + "|" + msg.method) ?? [])
      fn(msg.params);
  }
};
const { targetInfos } = await browser.send("Target.getTargets");
const target = targetInfos.find((t) => t.type === "page");
const { sessionId } = await browser.send("Target.attachToTarget", {
  targetId: target.targetId,
  flatten: true,
});
const send = (method, params = {}) => browser.send(method, params, sessionId, 30000);
const evaluate = async (expr) =>
  (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }))
    .result.value;
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

await sleep(1500);
const hwnd = spawnSync(
  "powershell",
  ["-NoProfile", "-Command", `(Get-Process -Id ${chrome.pid}).MainWindowHandle`],
  { encoding: "utf8" },
).stdout.trim();
if (!hwnd || hwnd === "0") throw new Error("no window handle for the recording Chrome");

const ffmpeg = spawn(
  "ffmpeg",
  [
    "-hide_banner",
    "-n",
    "-filter_complex",
    `gfxcapture=hwnd=${hwnd}:max_framerate=30:capture_cursor=0,hwdownload,format=bgra,scale=1440:-2,fps=30,format=yuv420p`,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "22",
    "-t",
    "90",
    out,
  ],
  { stdio: ["pipe", "ignore", "pipe"] },
);
let log = "";
const started = new Promise((resolve, reject) => {
  const t = setTimeout(
    () => reject(new Error("FFmpeg produced no frames:\n" + log.slice(-800))),
    15000,
  );
  ffmpeg.stderr.on("data", (d) => {
    log += d;
    if (/frame=\s*\d+/.test(log)) {
      clearTimeout(t);
      resolve();
    }
  });
});

const until = async (expr, ms = 60000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await evaluate(expr)) return;
    await sleep(200);
  }
  throw new Error("timed out: " + expr);
};
const click = (sel) => evaluate(`document.querySelector(${JSON.stringify(sel)}).click()`);

try {
  await started;
  await send("Page.navigate", { url: `${base}/` });
  await until(
    `getComputedStyle(document.querySelector("[data-slot=loader-actions]")).visibility === "visible"`,
  );
  await sleep(1500);
  await click('[data-action="enter-silent"]');
  await until(`document.querySelector("[data-slot=loader]").dataset.state === "hidden"`);
  await sleep(3000);
  await click(".hero__action");
  await sleep(8000);
  await click('[data-action="next"]');
  await sleep(3000);
  await click('[data-action="open-focused"]');
  await sleep(3500);
  await evaluate("history.back()");
  await sleep(2500);
  await evaluate("history.back()");
  await sleep(7000);
  console.log(
    "final",
    await evaluate("location.pathname + ' ' + document.documentElement.dataset.mode"),
  );
} finally {
  ffmpeg.stdin.write("q");
  await new Promise((r) => ffmpeg.on("exit", r));
  try {
    await browser.send("Browser.close", {}, undefined, 3000);
  } catch {}
  await sleep(500);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
  console.log(
    log
      .split("\n")
      .filter((l) => /frame=|error/i.test(l))
      .slice(-2)
      .join("\n"),
  );
}
