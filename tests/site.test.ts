import { parse, type HTMLElement } from "node-html-parser";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { startServer, type RunningServer } from "./server";

const site = "https://portfolio.lprieu.dev";
let server: RunningServer;

beforeAll(async () => {
  server = await startServer();
});

afterAll(() => server?.stop());

async function page(path: string): Promise<HTMLElement> {
  const response = await fetch(new URL(path, server.origin), { redirect: "manual" });
  expect(response.status).toBe(200);
  return parse(await response.text());
}

const pages = [
  {
    path: "/",
    lang: "fr",
    texts: { switcherLabel: "Langue", email: "E-mail" },
    switchTo: { href: "/en/", hreflang: "en", label: "English" },
  },
  {
    path: "/en/",
    lang: "en",
    texts: { switcherLabel: "Language", email: "Email" },
    switchTo: { href: "/", hreflang: "fr", label: "Français" },
  },
];

describe.each(pages)("$path rendered by the server", ({ path, lang, texts, switchTo }) => {
  test(`declares lang="${lang}"`, async () => {
    const html = await page(path);
    expect(html.querySelector("html")?.getAttribute("lang")).toBe(lang);
  });

  test("shows the localized interface texts", async () => {
    const html = await page(path);
    expect(html.querySelector("header nav")?.getAttribute("aria-label")).toBe(texts.switcherLabel);
    expect(html.querySelectorAll("[data-contact]").map((link) => link.text.trim())).toContain(
      texts.email,
    );
  });

  test("links the language switcher to the same page in the other language", async () => {
    const html = await page(path);
    const links = html.querySelectorAll("[data-language-switch]");
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute("href")).toBe(switchTo.href);
    expect(links[0]?.getAttribute("hreflang")).toBe(switchTo.hreflang);
    expect(links[0]?.text.trim()).toBe(switchTo.label);
  });

  test("declares every language version with hreflang", async () => {
    const html = await page(path);
    const alternates = Object.fromEntries(
      html
        .querySelectorAll('link[rel="alternate"]')
        .map((link) => [link.getAttribute("hreflang"), link.getAttribute("href")]),
    );
    expect(alternates).toEqual({
      fr: `${site}/`,
      en: `${site}/en/`,
      "x-default": `${site}/`,
    });
  });

  test("groups the contact links in a labelled footer section", async () => {
    const html = await page(path);
    const section = html.querySelector("footer section[aria-labelledby]");
    const heading = html.getElementById(section?.getAttribute("aria-labelledby") ?? "");
    expect(heading?.text).toBe("Contact");
    expect(section?.querySelectorAll("[data-contact]")).toHaveLength(3);
  });

  test("lists the three contact links with their icons in the footer", async () => {
    const html = await page(path);
    const hrefs = html
      .querySelectorAll("footer [data-contact]")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual([
      "https://www.linkedin.com/in/lprieu/",
      "mailto:lprieu.infos@gmail.com",
      "https://github.com/Firzus",
    ]);
    expect(html.querySelectorAll("footer [data-contact] svg")).toHaveLength(3);
  });

  test("frames the page with a header naming Lilian PRIEU and linking home", async () => {
    const html = await page(path);
    const home = html.querySelector("header [data-home]");
    expect(home?.text).toContain("Lilian PRIEU");
    expect(home?.getAttribute("href")).toBe(path);
  });

  test("preloads the Rubik font served by the site", async () => {
    const html = await page(path);
    const preload = html.querySelector('link[rel="preload"][as="font"]');
    expect(preload?.getAttribute("href")).toBe("/fonts/rubik.woff2");
    // Without it the browser discards the preload and downloads the font a second time.
    expect(preload?.getAttribute("crossorigin")).toBe("anonymous");
    const font = await fetch(new URL("/fonts/rubik.woff2", server.origin));
    expect(font.status).toBe(200);
    expect(font.headers.get("content-type")).toContain("font/woff2");
  });

  test("loads a stylesheet declaring the Encre palette and Rubik", async () => {
    const html = await page(path);
    const href = html.querySelector('link[rel="stylesheet"]')?.getAttribute("href");
    expect(href).toBeTruthy();
    const css = await (await fetch(new URL(href ?? "", server.origin))).text();
    expect(css).toMatch(/@font-face\s*\{[^}]*font-family:\s*"?Rubik"?/);
    expect(css).toMatch(/--color-ground:\s*#0c0b14/);
    expect(css).toMatch(/--color-accent:\s*#9d8cff/);
  });
});

async function missingPage(path: string): Promise<HTMLElement> {
  const response = await fetch(new URL(path, server.origin), { redirect: "manual" });
  expect(response.status).toBe(404);
  return parse(await response.text());
}

describe.each([
  { path: "/page-inconnue", lang: "fr", title: "Page introuvable", home: "/" },
  { path: "/en/unknown-page", lang: "en", title: "Page not found", home: "/en/" },
])("$path, a page that does not exist", ({ path, lang, title, home }) => {
  test("answers 404 with a localized message and a link home", async () => {
    const html = await missingPage(path);
    expect(html.querySelector("html")?.getAttribute("lang")).toBe(lang);
    expect(html.querySelector("h1")?.text).toBe(title);
    expect(html.querySelector("main a")?.getAttribute("href")).toBe(home);
  });

  test("offers no other language version", async () => {
    const html = await missingPage(path);
    expect(html.querySelectorAll('link[rel="alternate"]')).toHaveLength(0);
    expect(html.querySelectorAll("[data-language-switch]")).toHaveLength(0);
  });

  test("keeps the common frame", async () => {
    const html = await missingPage(path);
    expect(html.querySelector("header [data-home]")?.getAttribute("href")).toBe(home);
    expect(html.querySelectorAll("footer [data-contact]")).toHaveLength(3);
  });
});

const homes = [
  {
    path: "/",
    projectPath: "/projets/",
    pathsHeading: "Par où commencer ?",
    provisional: "provisoire",
    lysandraAlt: "Illustration provisoire",
  },
  {
    path: "/en/",
    projectPath: "/en/projects/",
    pathsHeading: "Where to start?",
    provisional: "provisional",
    lysandraAlt: "Provisional illustration",
  },
];

describe.each(homes)(
  "$path, the home page",
  ({ path, projectPath, pathsHeading, provisional, lysandraAlt }) => {
    test("opens on the job title, with the name read only by screen readers", async () => {
      const html = await page(path);
      const headings = html.querySelectorAll("h1");
      expect(headings).toHaveLength(1);
      const heading = headings[0];
      expect(heading?.querySelector(".sr-only")?.text).toContain("Lilian PRIEU");
      expect(heading?.text).toContain("Lilian PRIEU");
      heading?.querySelector(".sr-only")?.remove();
      expect(heading?.text.trim()).toBe("Software Engineer");
    });

    test("shows one card per project, linking to its page in the current language", async () => {
      const html = await page(path);
      const cards = html.querySelectorAll("#projects [data-project-card]");
      expect(cards.map((card) => card.querySelector("h3")?.text.trim())).toEqual([
        "Lysandra",
        "Huzounet",
        "Atelier",
      ]);
      expect(cards.map((card) => card.querySelector("a")?.getAttribute("href"))).toEqual([
        `${projectPath}lysandra`,
        `${projectPath}huzounet`,
        `${projectPath}atelier`,
      ]);
    });

    test("shows the provisional pictures, described in the current language", async () => {
      const html = await page(path);
      const pictures = html.querySelectorAll("main img");
      expect(pictures.length).toBeGreaterThanOrEqual(6);
      for (const picture of pictures) {
        expect(picture.getAttribute("src")).toMatch(/^\/images\/placeholders\/[\w-]+\.webp$/);
        expect(picture.getAttribute("alt")).toMatch(/\S/);
        expect(picture.getAttribute("width")).toBeTruthy();
        expect(picture.getAttribute("height")).toBeTruthy();
      }
      expect(pictures[0]?.getAttribute("alt")).toContain(lysandraAlt);
      const file = await fetch(new URL(pictures[0]?.getAttribute("src") ?? "", server.origin));
      expect(file.status).toBe(200);
      expect(file.headers.get("content-type")).toContain("image/webp");
    });

    test("lists the links by intent, with every contact and the CV", async () => {
      const html = await page(path);
      const section = html
        .querySelectorAll("main section")
        .find((candidate) => candidate.querySelector("h2")?.text.trim() === pathsHeading);
      expect(section).toBeDefined();
      const hrefs = section?.querySelectorAll("a").map((link) => link.getAttribute("href"));
      expect(hrefs).toEqual(
        expect.arrayContaining([
          "https://www.linkedin.com/in/lprieu/",
          "mailto:lprieu.infos@gmail.com",
          "https://github.com/Firzus",
          `${projectPath}lysandra`,
        ]),
      );
      const cv = section?.querySelector("[data-intent-row='cv']");
      expect(cv?.querySelector("[data-slot='provisional-mark']")?.text.trim()).toBe(provisional);
    });

    test("marks the text Lilian has not confirmed as provisional", async () => {
      const html = await page(path);
      const marks = html.querySelectorAll("main [data-slot='provisional-mark']");
      expect(marks.length).toBeGreaterThan(0);
      expect(marks.map((mark) => mark.text.trim())).toEqual(marks.map(() => provisional));
      expect(html.querySelector("main h1 ~ p [data-slot='provisional-mark']")).not.toBeNull();
    });

    test("uses no hash link standing for a missing page", async () => {
      const html = await page(path);
      const hrefs = html.querySelectorAll("main a").map((link) => link.getAttribute("href") ?? "");
      expect(hrefs.filter((href) => href.startsWith("#") && href !== "#projects")).toEqual([]);
    });
  },
);
