import { parse, type HTMLElement } from "node-html-parser";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { startServer, type RunningServer } from "./server";

const site = "https://portfolio.lprieu.dev";
let server: RunningServer;

beforeAll(async () => {
  server = await startServer();
});

afterAll(() => server?.stop());

function get(path: string): Promise<Response> {
  return fetch(new URL(path, server.origin), { redirect: "manual" });
}

async function page(path: string): Promise<HTMLElement> {
  const response = await get(path);
  expect(response.status).toBe(200);
  return parse(await response.text());
}

const languages = [
  {
    path: "/agents-ia",
    lang: "fr",
    title: "Travailler avec des agents IA",
    other: { path: "/en/ai-agents", locale: "en", label: "English" },
    home: "/",
    homeHeading: "Par où commencer ?",
    sections: [
      "Pourquoi une méthode",
      "D'où ça vient",
      "Le parcours d'une demande",
      "Linear comme mémoire",
      "Les tests d'abord, des preuves ensuite",
      "Une revue indépendante",
      "Étude de cas : ce portfolio",
      "Une méthode qui évolue et se partage",
    ],
  },
  {
    path: "/en/ai-agents",
    lang: "en",
    title: "Working with AI agents",
    other: { path: "/agents-ia", locale: "fr", label: "Français" },
    home: "/en/",
    homeHeading: "Where to start?",
    sections: [
      "Why a method",
      "Where it comes from",
      "The path of a request",
      "Linear as memory",
      "Tests first, then evidence",
      "An independent review",
      "Case study: this portfolio",
      "A method that changes and is shared",
    ],
  },
];

describe.each(languages)(
  "$path, the AI agents note",
  ({ path, lang, title, other, home, homeHeading, sections }) => {
    test(`is rendered by the server in "${lang}", under its own title`, async () => {
      const html = await page(path);
      expect(html.querySelector("html")?.getAttribute("lang")).toBe(lang);
      expect(html.querySelectorAll("h1").map((heading) => heading.text.trim())).toEqual([title]);
      expect(html.querySelector("title")?.text).toContain(title);
      expect(html.querySelector('meta[name="description"]')?.getAttribute("content")).toMatch(/\S/);
    });

    test("links the language switcher and hreflang to the same note", async () => {
      const html = await page(path);
      const switcher = html.querySelector("[data-language-switch]");
      expect(switcher?.getAttribute("href")).toBe(other.path);
      expect(switcher?.getAttribute("hreflang")).toBe(other.locale);
      expect(switcher?.text.trim()).toBe(other.label);
      const alternates = Object.fromEntries(
        html
          .querySelectorAll('link[rel="alternate"]')
          .map((alternate) => [alternate.getAttribute("hreflang"), alternate.getAttribute("href")]),
      );
      expect(alternates).toEqual({
        fr: `${site}/agents-ia`,
        en: `${site}/en/ai-agents`,
        "x-default": `${site}/agents-ia`,
      });
    });

    test("follows the eight sections of the plan, in order", async () => {
      const html = await page(path);
      const headings = html.querySelectorAll("main article h2").map((h) => h.text.trim());
      expect(headings).toHaveLength(sections.length);
      headings.forEach((heading, index) => expect(heading).toContain(sections[index]));
    });

    test("lists the sections in a table of contents pointing at each of them", async () => {
      const html = await page(path);
      const targets = html
        .querySelectorAll("main nav a")
        .map((link) => link.getAttribute("href") ?? "");
      const ids = html
        .querySelectorAll("main article h2")
        .map((h) => `#${h.closest("section")?.id}`);
      expect(targets).toEqual(ids);
    });

    test("shows the path of a request as text, from /work to the delivery", async () => {
      const html = await page(path);
      const steps = html.querySelectorAll("main [data-request-path] li");
      expect(steps.length).toBeGreaterThanOrEqual(5);
      const text = html.querySelector("main [data-request-path]")?.text ?? "";
      for (const word of ["/work", "Quick", "Small", "Project"]) expect(text).toContain(word);
    });

    test("cites every figure and every quote to a public source", async () => {
      const html = await page(path);
      const figures = html.querySelectorAll("main [data-slot='stat']");
      expect(figures.length).toBeGreaterThan(0);
      for (const figure of figures) {
        expect(figure.querySelector("a")?.getAttribute("href")).toMatch(
          /^https:\/\/github\.com\/Firzus\//,
        );
      }
      const quotes = html.querySelectorAll("main blockquote");
      expect(quotes.length).toBeGreaterThan(0);
      for (const quote of quotes) {
        expect(quote.getAttribute("cite")).toMatch(/^https:\/\/github\.com\/Firzus\//);
        expect(quote.parentNode?.querySelector("figcaption a")?.getAttribute("href")).toBe(
          quote.getAttribute("cite"),
        );
      }
    });

    test("is reached from the home page's « where to start » links", async () => {
      const html = await page(home);
      const section = html
        .querySelectorAll("main section")
        .find((candidate) => candidate.querySelector("h2")?.text.trim() === homeHeading);
      const hrefs = section?.querySelectorAll("a").map((link) => link.getAttribute("href"));
      expect(hrefs).toContain(path);
    });
  },
);

test("redirects the French segment under /en/ to the English address", async () => {
  const response = await get("/en/agents-ia");
  expect(response.status).toBe(301);
  expect(response.headers.get("location")).toBe("/en/ai-agents");
});

test("does not answer under the English segment without /en/", async () => {
  const response = await get("/ai-agents");
  expect(response.status).toBe(404);
});
