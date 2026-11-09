import { parse, type HTMLElement } from "node-html-parser";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { currentNavItem } from "../src/components/navigation";
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

async function stylesheet(): Promise<string> {
  const href = (await page("/"))
    .querySelectorAll("link[rel=stylesheet]")
    .map((link) => link.getAttribute("href"))
    .find(Boolean);
  expect(href).toBeDefined();
  return fetchText(href!);
}

const navigation = [
  { path: "/", label: "Navigation principale", current: "Accueil" },
  { path: "/projets/lysandra", label: "Navigation principale", current: "Projets" },
  { path: "/agents-ia", label: "Navigation principale", current: "Agents IA" },
  { path: "/en/", label: "Main navigation", current: "Home" },
  { path: "/en/projects/atelier", label: "Main navigation", current: "Projects" },
  { path: "/en/ai-agents", label: "Main navigation", current: "AI agents" },
];

describe.each(navigation)("the header menu on $path", ({ path, label, current }) => {
  test("is a labelled list of the three sections, readable without scripts", async () => {
    const nav = (await page(path)).querySelector("header nav[data-slot=main-nav]");
    expect(nav?.getAttribute("aria-label")).toBe(label);
    expect(nav?.querySelectorAll("[data-slot=nav-link]")).toHaveLength(3);
  });

  test("marks the current section", async () => {
    const nav = (await page(path)).querySelector("header nav[data-slot=main-nav]");
    const marked = nav?.querySelectorAll("[aria-current=page]") ?? [];
    expect(marked.map((link) => link.text.trim())).toEqual([current]);
  });

  test("keeps the reader's language in its links", async () => {
    const nav = (await page(path)).querySelector("header nav[data-slot=main-nav]");
    const hrefs = nav?.querySelectorAll("[data-slot=nav-link]").map((l) => l.getAttribute("href"));
    expect(hrefs).toEqual(
      path.startsWith("/en/")
        ? ["/en/", "/en/#projects", "/en/ai-agents"]
        : ["/", "/#projects", "/agents-ia"],
    );
  });
});

describe("the current section of a path", () => {
  test.each([
    ["/", "home"],
    ["/projets/huzounet", "projects"],
    ["/agents-ia", "agents"],
    ["/introuvable", undefined],
  ])("%s is %s", (pathname, item) => {
    expect(currentNavItem(pathname)).toBe(item);
  });
});

describe("the home page rendered by the server", () => {
  test("draws a static fill for every shader, hidden from assistive technology", async () => {
    const html = await page("/");
    const scenes = html.querySelectorAll("[data-scene]");
    const names = scenes.map((scene) => scene.getAttribute("data-scene") ?? "");
    expect(names.sort((a, b) => a.localeCompare(b))).toEqual([
      "button",
      "hero",
      "icon-agents",
      "icon-contact",
      "icon-play",
      "icon-tools",
      "icon-unity",
    ]);
    scenes.forEach((scene) => expect(scene.getAttribute("aria-hidden")).toBe("true"));
    expect(html.querySelector("canvas")).toBeNull();
  });

  test("puts the button shader under the primary actions only", async () => {
    const html = await page("/");
    for (const button of html.querySelectorAll("[data-slot=link-button]")) {
      const solid = button.getAttribute("data-variant") === "solid";
      expect(button.querySelector("[data-scene=button]") !== null).toBe(solid);
    }
  });

  test("gives each link row a fill to pour in", async () => {
    const rows = (await page("/")).querySelectorAll("[data-slot=row-link]");
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) =>
      expect(row.querySelector("[data-slot=row-fill]")?.getAttribute("aria-hidden")).toBe("true"),
    );
  });

  test("defines the liquid filters once", async () => {
    const html = await page("/");
    expect(html.querySelectorAll("filter#fluid-goo")).toHaveLength(1);
    expect(html.querySelectorAll("filter#fluid-ripple")).toHaveLength(1);
  });
});

describe("the stylesheet", () => {
  test("declares the shader colours as theme tokens", async () => {
    const css = await stylesheet();
    for (const token of [
      "--color-shader-mid",
      "--color-shader-bright",
      "--color-shader-button-dark",
      "--color-shader-button-light",
      "--color-shader-button-fold",
    ]) {
      expect(css).toMatch(new RegExp(`${token}:\\s*#`));
    }
  });

  test("fills each shader area with the palette before and without the shader", async () => {
    const css = await stylesheet();
    expect(css).toMatch(
      /\[data-scene=["']?hero["']?\]\s*\{\s*background(-color)?:\s*var\(--color-deep\)/,
    );
    expect(css).toMatch(
      /\[data-scene=["']?button["']?\]\s*\{\s*background(-color)?:\s*var\(--color-accent\)/,
    );
  });

  test("lets the current menu link carry the pill's fill without scripts", async () => {
    const css = await stylesheet();
    expect(css).toMatch(
      /html:not\(\.js\)[^{]*\[aria-current=["']?page["']?\][^{]*\{\s*background-color:\s*var\(--color-pill\)/,
    );
  });
});
