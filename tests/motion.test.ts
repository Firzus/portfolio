import { parse, type HTMLElement } from "node-html-parser";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { nameMark } from "../src/components/motion/lettering";
import { thumbLayout } from "../src/components/motion/scrollbarLayout";
import { swollenName } from "../src/components/motion/wave";
import { startServer, type RunningServer } from "./server";

let server: RunningServer;

beforeAll(async () => {
  server = await startServer();
});

afterAll(() => server?.stop());

async function fetchText(path: string): Promise<string> {
  const response = await fetch(new URL(path, server.origin));
  expect(response.status).toBe(200);
  return response.text();
}

async function page(path: string): Promise<HTMLElement> {
  return parse(await fetchText(path));
}

async function stylesheet(html: HTMLElement): Promise<string> {
  const href = html
    .querySelectorAll("link[rel=stylesheet]")
    .map((link) => link.getAttribute("href"))
    .find(Boolean);
  expect(href).toBeDefined();
  return fetchText(href!);
}

describe.each([
  { path: "/", label: "Chargement du portfolio" },
  { path: "/en/", label: "Loading the portfolio" },
])("the loading screen on $path", ({ path, label }) => {
  test("is rendered by the server, hidden from assistive technology", async () => {
    const loader = (await page(path)).querySelector("[data-slot=loader]");
    expect(loader).not.toBeNull();
    expect(loader?.getAttribute("aria-hidden")).toBe("true");
    expect(loader?.text).toContain(label);
  });

  test("draws the name's lettering", async () => {
    const name = (await page(path)).querySelector("[data-slot=loader-name]");
    expect(name?.getAttribute("d")).toBe(nameMark.d);
  });
});

describe("the page head", () => {
  test("marks the document as scripted before the first paint", async () => {
    const head = (await page("/")).querySelector("head");
    const script = head?.querySelectorAll("script").find((s) => s.text.includes("classList.add"));
    expect(script?.text).toContain('"js"');
  });
});

describe("the stylesheet", () => {
  test("hides the loading screen unless the page runs scripts and allows motion", async () => {
    const css = await stylesheet(await page("/"));
    // Hidden by default; shown only under html.js with motion allowed, on the session's first page.
    expect(css).toMatch(/\[data-slot=["']?loader["']?\]\s*\{\s*display:\s*none/);
    expect(css).toMatch(
      /prefers-reduced-motion:\s*no-preference[\s\S]*html\.js:not\(\.skip-loader\)\s*\[data-slot=["']?loader["']?\]/,
    );
  });

  test("turns page transitions off under reduced motion", async () => {
    const css = await stylesheet(await page("/"));
    expect(css).toMatch(
      /prefers-reduced-motion:\s*reduce[\s\S]*@view-transition\s*\{\s*navigation:\s*none/,
    );
  });
});

describe("the swell through the name", () => {
  test("leaves the drawn path untouched at rest", () => {
    expect(swollenName({ amount: 0, x: 500, phase: 0 })).toBe(nameMark.d);
  });

  test("moves the points near its centre and keeps the path's commands", () => {
    const swollen = swollenName({ amount: 1, x: nameMark.width / 2, phase: 1 });
    expect(swollen).not.toBe(nameMark.d);
    const commands = (d: string) => d.replace(/[-\d.]+/g, "").replace(/\s+/g, "");
    expect(commands(swollen)).toBe(commands(nameMark.d));
  });
});

describe("the scrollbar drop", () => {
  test("is as tall as the visible share of the page, and at the top before scrolling", () => {
    expect(thumbLayout({ view: 800, page: 3200, room: 780, scroll: 0 })).toEqual({
      size: 195,
      offset: 0,
      scrollable: true,
    });
  });

  test("reaches the end of its track at the bottom of the page", () => {
    const { size, offset } = thumbLayout({ view: 800, page: 3200, room: 780, scroll: 2400 });
    expect(offset + size).toBe(780);
  });

  test("keeps a minimum height on a very long page", () => {
    expect(thumbLayout({ view: 800, page: 80_000, room: 780, scroll: 0 }).size).toBe(48);
  });

  test("is not needed when the page fits the window", () => {
    expect(thumbLayout({ view: 800, page: 800, room: 780, scroll: 0 }).scrollable).toBe(false);
  });
});
