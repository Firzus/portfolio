import { parse } from "node-html-parser";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { textLinkVariants } from "../src/components/ui/text-link";
import { startServer, type RunningServer } from "./server";

describe("an accent link in running text", () => {
  test("is underlined at rest, not only on hover, so colour is not its only cue", () => {
    const classes = textLinkVariants({ variant: "accent" }).split(/\s+/);
    expect(classes).toContain("underline");
  });
});

describe("the home page's sections", () => {
  let server: RunningServer;
  beforeAll(async () => {
    server = await startServer();
  });
  afterAll(() => server?.stop());

  test("start their headings on the same edge", async () => {
    const html = parse(await (await fetch(new URL("/", server.origin))).text());
    const intro = html.querySelector("#intents-heading")?.parentNode;
    expect(intro?.getAttribute("class") ?? "").not.toMatch(/(^|\s)(lg:|md:)?pl-/);
  });
});

describe("the other projects at the end of a project page", () => {
  let server: RunningServer;
  beforeAll(async () => {
    server = await startServer();
  });
  afterAll(() => server?.stop());

  test.each([
    ["/projets/lysandra", ["Huzounet", "Atelier"]],
    ["/en/projects/atelier", ["Lysandra", "Huzounet"]],
  ])("on %s show only a picture and a name, unlike the home cards", async (path, names) => {
    const html = parse(await (await fetch(new URL(path, server.origin))).text());
    const cards = html.querySelector("#others-heading")?.parentNode?.querySelectorAll("li") ?? [];
    expect(cards.map((card) => card.text.trim())).toEqual(names);
    cards.forEach((card) => {
      expect(card.querySelector("[data-slot=thumbnail]")).toBeTruthy();
      expect(card.querySelector("[data-slot=chip]")).toBeNull();
    });
  });
});

describe("the AI agents note", () => {
  let server: RunningServer;
  beforeAll(async () => {
    server = await startServer();
  });
  afterAll(() => server?.stop());

  test.each([
    ["/agents-ia", "Retour au sommaire"],
    ["/en/ai-agents", "Back to contents"],
  ])("on %s keeps a way back to its contents while reading", async (path, label) => {
    const html = parse(await (await fetch(new URL(path, server.origin))).text());
    const back = html.querySelector("[data-toc-return]");
    expect(back?.getAttribute("href")).toBe("#toc-heading");
    expect(back?.text.trim()).toBe(label);
    expect(html.querySelector("#toc-heading")).toBeTruthy();
  });
});

describe("the GitHub calendar on a phone", () => {
  let server: RunningServer;
  beforeAll(async () => {
    server = await startServer();
  });
  afterAll(() => server?.stop());

  test("keeps only the last 26 weeks, so the days stay large enough to see", async () => {
    const html = parse(await (await fetch(new URL("/", server.origin))).text());
    const cells = html.querySelectorAll("[data-slot=contribution-grid] > span");
    const shown = cells.filter((cell) => !/max-sm:hidden/.test(cell.getAttribute("class") ?? ""));
    expect(shown.length).toBeGreaterThan(25 * 7);
    expect(shown.length).toBeLessThanOrEqual(26 * 7);
    // The shown days are the latest ones.
    expect(cells.slice(cells.length - shown.length)).toEqual(shown);
  });
});

describe("the site's voice", () => {
  let server: RunningServer;
  beforeAll(async () => {
    server = await startServer();
  });
  afterAll(() => server?.stop());

  test.each([
    "/",
    "/projets/lysandra",
    "/projets/huzounet",
    "/projets/atelier",
    "/agents-ia",
    "/en/",
    "/en/projects/lysandra",
    "/en/projects/huzounet",
    "/en/projects/atelier",
    "/en/ai-agents",
  ])("on %s speaks in the first person, never of Lilian as someone else", async (path) => {
    const html = parse(await (await fetch(new URL(path, server.origin))).text());
    // The full name stays where it names the site's author, as in the home page's heading.
    expect(html.querySelector("main")?.text).not.toMatch(/Lilian(?! PRIEU)/);
  });
});

describe("the name of the agents section", () => {
  let server: RunningServer;
  beforeAll(async () => {
    server = await startServer();
  });
  afterAll(() => server?.stop());

  test.each(["/", "/agents-ia", "/en/", "/en/ai-agents"])(
    "on %s is just « Agents », with no « IA » or « AI »",
    async (path) => {
      const html = parse(await (await fetch(new URL(path, server.origin))).text());
      const text = [html.querySelector("title"), html.querySelector("body")]
        .map((node) => node?.text ?? "")
        .join(" ");
      expect(text).not.toMatch(/agents IA|AI agents/i);
    },
  );
});

describe("every button", () => {
  let server: RunningServer;
  beforeAll(async () => {
    server = await startServer();
  });
  afterAll(() => server?.stop());

  test("shows the pointing hand, as links do, unless it is disabled", async () => {
    const html = parse(await (await fetch(new URL("/", server.origin))).text());
    const href = html.querySelector("link[rel=stylesheet]")?.getAttribute("href") ?? "";
    const css = await (await fetch(new URL(href, server.origin))).text();
    expect(css).toMatch(/button:not\(:disabled\)[^{]*\{\s*cursor:\s*pointer/);
  });
});
