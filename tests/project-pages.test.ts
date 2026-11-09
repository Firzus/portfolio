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
  // By default the parser keeps a <pre> as raw text; the code sample inside it is checked as markup.
  return parse(await response.text(), { blockTextElements: { script: true, style: true } });
}

const french = {
  lang: "fr",
  prefix: "/projets/",
  other: { prefix: "/en/projects/", locale: "en", label: "English" },
  home: "/",
  headings: ["Contexte", "Rôle", "Ce que Lilian a construit", "Images", "Liens", "Autres projets"],
};
const english = {
  lang: "en",
  prefix: "/en/projects/",
  other: { prefix: "/projets/", locale: "fr", label: "Français" },
  home: "/en/",
  headings: ["Context", "Role", "What Lilian built", "Pictures", "Links", "Other projects"],
};

const projects = [
  { slug: "lysandra", name: "Lysandra", link: "https://lysandra.faill.studio" },
  { slug: "huzounet", name: "Huzounet", link: "https://huzounet.fr" },
  { slug: "atelier", name: "Atelier", link: "https://github.com/Firzus/atelier" },
];

const cases = projects.flatMap((project) =>
  [french, english].map((language) => ({
    ...project,
    ...language,
    path: `${language.prefix}${project.slug}`,
  })),
);

describe.each(cases)(
  "$path, a project page",
  ({ slug, name, link, lang, prefix, other, home, headings, path }) => {
    test(`is rendered by the server in "${lang}", titled after the project`, async () => {
      const html = await page(path);
      expect(html.querySelector("html")?.getAttribute("lang")).toBe(lang);
      expect(html.querySelectorAll("h1").map((heading) => heading.text.trim())).toEqual([name]);
      expect(html.querySelector("title")?.text).toContain(name);
    });

    test("has the case study sections", async () => {
      const html = await page(path);
      const found = html.querySelectorAll("main h2").map((heading) => heading.text.trim());
      expect(found).toEqual(expect.arrayContaining(headings));
    });

    test("links the language switcher and hreflang to the same project", async () => {
      const html = await page(path);
      const switcher = html.querySelector("[data-language-switch]");
      expect(switcher?.getAttribute("href")).toBe(`${other.prefix}${slug}`);
      expect(switcher?.getAttribute("hreflang")).toBe(other.locale);
      expect(switcher?.text.trim()).toBe(other.label);
      const alternates = Object.fromEntries(
        html
          .querySelectorAll('link[rel="alternate"]')
          .map((alternate) => [alternate.getAttribute("hreflang"), alternate.getAttribute("href")]),
      );
      expect(alternates).toEqual({
        fr: `${site}/projets/${slug}`,
        en: `${site}/en/projects/${slug}`,
        "x-default": `${site}/projets/${slug}`,
      });
    });

    test("links to the project outside the site", async () => {
      const html = await page(path);
      const hrefs = html.querySelectorAll("main a").map((anchor) => anchor.getAttribute("href"));
      expect(hrefs).toContain(link);
    });

    test("shows described pictures served by the site", async () => {
      const html = await page(path);
      const pictures = html.querySelectorAll("main img");
      expect(pictures.length).toBeGreaterThanOrEqual(2);
      for (const picture of pictures) {
        expect(picture.getAttribute("alt")).toMatch(/\S/);
        expect(picture.getAttribute("width")).toBeTruthy();
        expect(picture.getAttribute("height")).toBeTruthy();
        const file = await get(picture.getAttribute("src") ?? "");
        expect(file.status).toBe(200);
      }
    });

    test("links to the other two projects in the same language", async () => {
      const html = await page(path);
      const hrefs = html
        .querySelectorAll("main [data-project-card] a")
        .map((anchor) => anchor.getAttribute("href"));
      const others = projects.filter((project) => project.slug !== slug);
      expect(hrefs).toEqual(others.map((project) => `${prefix}${project.slug}`));
    });

    test("leads back to the project list of the home page", async () => {
      const html = await page(path);
      const hrefs = html.querySelectorAll("main a").map((anchor) => anchor.getAttribute("href"));
      expect(hrefs).toContain(`${home}#projects`);
    });
  },
);

describe("content that Lilian asked to leave out", () => {
  test.each([
    { slug: "lysandra", banned: /kickstarter|unreal|free-to-play/i },
    { slug: "huzounet", banned: /\bflow\b|collecteur|\bHDV\b/i },
    { slug: "atelier", banned: /no-code|production-ready|prêt pour la production/i },
  ])("is absent from the $slug pages", async ({ slug, banned }) => {
    for (const path of [`/projets/${slug}`, `/en/projects/${slug}`]) {
      const html = await page(path);
      expect(html.querySelector("main")?.text).not.toMatch(banned);
    }
  });
});

test("shows Atelier's C# condition as text, not as a picture", async () => {
  for (const path of ["/projets/atelier", "/en/projects/atelier"]) {
    const html = await page(path);
    const code = html.querySelector("main pre code");
    expect(code?.text).toContain("public class IsOnScreenCondition : Condition");
    // Its long lines scroll sideways, so the keyboard must reach it, and it needs a name.
    const pre = html.querySelector("main pre");
    expect(pre?.getAttribute("tabindex")).toBe("0");
    const name = html.getElementById(pre?.getAttribute("aria-labelledby") ?? "");
    expect(name?.text.trim()).toBe("IsOnScreenCondition.cs");
  }
});

test("describes Lysandra on the home page as on its own page", async () => {
  for (const path of ["/", "/en/"]) {
    const html = await page(path);
    expect(html.querySelector("#projects")?.text).not.toMatch(/aventure|adventure/i);
  }
});

test("gives Huzounet's build count once, as the exact figure", async () => {
  for (const path of ["/projets/huzounet", "/en/projects/huzounet"]) {
    const html = await page(path);
    expect(html.querySelector("main")?.text).not.toMatch(/\b1[\s, ]?900\b/);
  }
});

test("marks Lysandra's provisional pictures as provisional", async () => {
  const html = await page("/projets/lysandra");
  expect(html.querySelectorAll("main [data-slot='provisional-mark']").length).toBeGreaterThan(0);
});

test("redirects the French segment under /en/ to the English address", async () => {
  const response = await get("/en/projets/atelier");
  expect(response.status).toBe(301);
  expect(response.headers.get("location")).toBe("/en/projects/atelier");
});

describe.each([
  { path: "/projets/inconnu", lang: "fr", title: "Page introuvable" },
  { path: "/en/projects/unknown", lang: "en", title: "Page not found" },
  { path: "/projects/atelier", lang: "fr", title: "Page introuvable" },
])("$path, not a project page", ({ path, lang, title }) => {
  test("answers 404 with the localized missing page", async () => {
    const response = await get(path);
    expect(response.status).toBe(404);
    const html = parse(await response.text());
    expect(html.querySelector("html")?.getAttribute("lang")).toBe(lang);
    expect(html.querySelector("h1")?.text).toBe(title);
    expect(html.querySelectorAll('link[rel="alternate"]')).toHaveLength(0);
  });
});
