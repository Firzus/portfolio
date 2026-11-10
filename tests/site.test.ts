import { nameMark } from "../src/components/motion/lettering";
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
    const switcher = html
      .querySelectorAll("header nav")
      .find((nav) => nav.querySelector("[data-language-switch]"));
    expect(switcher?.getAttribute("aria-label")).toBe(texts.switcherLabel);
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

  test("writes the name in the loading screen's hand lettering, without a monogram", async () => {
    const html = await page(path);
    const home = html.querySelector("header [data-home]");
    const mark = home?.querySelector("svg[data-slot=name-mark]");
    expect(mark?.getAttribute("aria-hidden")).toBe("true");
    expect(mark?.querySelector("path")?.getAttribute("d")).toBe(nameMark.d);
    expect(home?.querySelector(".sr-only")?.text).toBe("Lilian PRIEU");
    expect(home?.text).not.toContain("LP");
  });

  test("keeps the header at the top of the screen, and anchors clear of it", async () => {
    const html = await page(path);
    const header = html.querySelector("header")?.classList;
    expect(header?.contains("sticky")).toBe(true);
    expect(header?.contains("top-0")).toBe(true);
    // Opaque, so the page does not show through it while scrolling.
    expect(header?.contains("bg-ground")).toBe(true);
    // An in-page link (#projects) must not land its target under the header.
    expect(html.querySelector("html")?.classList.contains("scroll-pt-16")).toBe(true);
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
    jobTitle: "Ingénieur logiciel",
    lead: "De l'idée au logiciel en ligne, je m'occupe de tout le chemin, du code à la mise en production.",
    lysandraAlt: "Illustration provisoire",
    huzounetAlt: "La liste des équipements de huzounet.fr",
    atelierAlt: "Le sélecteur d'instructions d'Atelier",
  },
  {
    path: "/en/",
    projectPath: "/en/projects/",
    pathsHeading: "Where to start?",
    provisional: "provisional",
    jobTitle: "Software Engineer",
    lead: "From idea to live software, I take care of the whole way, from code to production.",
    lysandraAlt: "Provisional illustration",
    huzounetAlt: "The huzounet.fr equipment list",
    atelierAlt: "Atelier's instruction picker",
  },
];

describe.each(homes)(
  "$path, the home page",
  ({
    path,
    projectPath,
    pathsHeading,
    provisional,
    jobTitle,
    lead,
    lysandraAlt,
    huzounetAlt,
    atelierAlt,
  }) => {
    test("opens on the job title, with the name read only by screen readers", async () => {
      const html = await page(path);
      const headings = html.querySelectorAll("h1");
      expect(headings).toHaveLength(1);
      const heading = headings[0];
      expect(heading?.querySelector(".sr-only")?.text).toContain("Lilian PRIEU");
      expect(heading?.text).toContain("Lilian PRIEU");
      heading?.querySelector(".sr-only")?.remove();
      expect(heading?.text.trim()).toBe(jobTitle);
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

    test("shows the real media of Huzounet and Atelier, described in the current language", async () => {
      const html = await page(path);
      const pictures = html.querySelectorAll("main img");
      expect(pictures.length).toBeGreaterThanOrEqual(6);
      for (const picture of pictures) {
        expect(picture.getAttribute("src")).toMatch(
          /^\/images\/(placeholders|projects\/(huzounet|atelier))\/[\w-]+\.(webp|avif)$/,
        );
        expect(picture.getAttribute("alt")).toBeDefined();
        expect(picture.getAttribute("width")).toBeTruthy();
        expect(picture.getAttribute("height")).toBeTruthy();
      }
      const described = html.querySelectorAll("#projects img");
      expect(described).toHaveLength(3);
      expect(described.every((picture) => /\S/.test(picture.getAttribute("alt") ?? ""))).toBe(true);
      expect(described[0]?.getAttribute("alt")).toContain(lysandraAlt);
      expect(described[1]?.getAttribute("src")).toMatch(/^\/images\/projects\/huzounet\//);
      expect(described[1]?.getAttribute("alt")).toContain(huzounetAlt);
      expect(described[2]?.getAttribute("src")).toMatch(/^\/images\/projects\/atelier\//);
      expect(described[2]?.getAttribute("alt")).toContain(atelierAlt);
      for (const picture of pictures) {
        const src = picture.getAttribute("src") ?? "";
        const file = await fetch(new URL(src, server.origin));
        expect(file.status).toBe(200);
        expect(file.headers.get("content-type")).toContain(
          src.endsWith(".avif") ? "image/avif" : "image/webp",
        );
      }
    });

    test("names each hero picture link after its project alone", async () => {
      const html = await page(path);
      const links = html.querySelectorAll("main a").filter((link) => link.querySelector("img"));
      const heroLinks = links.filter((link) => !link.closest("#projects"));
      expect(heroLinks).toHaveLength(3);
      for (const link of heroLinks) {
        expect(link.querySelector("img")?.getAttribute("alt")).toBe("");
        expect(link.text.trim()).toMatch(/^(Lysandra|Huzounet|Atelier)\b/);
      }
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
    });

    test("opens on the tagline Lilian chose, confirmed and so not marked provisional", async () => {
      const html = await page(path);
      const shown = html.querySelector("main h1 ~ p");
      expect(shown?.text.trim()).toBe(lead);
      expect(shown?.querySelector("[data-slot='provisional-mark']")).toBeNull();
    });

    test("invites the reader to get in touch in the first person, as the tagline speaks", async () => {
      const html = await page(path);
      const contact = html.querySelector("main a[href^='mailto:']");
      expect(contact?.text.trim()).toBe(path === "/" ? "Me contacter" : "Contact me");
    });

    test("uses no hash link standing for a missing page", async () => {
      const html = await page(path);
      const hrefs = html.querySelectorAll("main a").map((link) => link.getAttribute("href") ?? "");
      expect(hrefs.filter((href) => href.startsWith("#") && href !== "#projects")).toEqual([]);
    });
  },
);

describe("the project cards' tags", () => {
  test.each([
    [
      "/",
      [
        ["Jeu vidéo", "Action RPG", "Démo"],
        ["Fansite", "Dofus", "Web"],
        ["Open source", "Unity", "Framework"],
      ],
    ],
    [
      "/en/",
      [
        ["Video game", "Action RPG", "Demo"],
        ["Fan site", "Dofus", "Web"],
        ["Open source", "Unity", "Framework"],
      ],
    ],
  ])("on %s", async (path, expected) => {
    const cards = (await page(path)).querySelectorAll("#projects [data-project-card]");
    expect(
      cards.map((card) => card.querySelectorAll("[data-slot=chip]").map((c) => c.text.trim())),
    ).toEqual(expected);
  });
});

const everyKindOfPage = [
  "/",
  "/en/",
  "/projets/lysandra",
  "/projets/huzounet",
  "/en/projects/atelier",
  "/agents-ia",
  "/en/ai-agents",
].map((path) => ({ path }));

describe.each(everyKindOfPage)("links to other sites on $path", ({ path }) => {
  test("open in a new tab, without giving it this page, and say so", async () => {
    const html = await page(path);
    const external = html
      .querySelectorAll("body a[href^='http']")
      .filter((a) => !a.getAttribute("href")!.startsWith(site));
    expect(external.length).toBeGreaterThan(0);
    for (const a of external) {
      expect(a.getAttribute("target"), a.getAttribute("href")).toBe("_blank");
      expect(a.getAttribute("rel")?.split(" ")).toEqual(expect.arrayContaining(["noopener"]));
      expect(a.querySelector("[data-slot=new-tab-note]")?.text.trim()).toBe(
        path.startsWith("/en/") ? "(opens in a new tab)" : "(s'ouvre dans un nouvel onglet)",
      );
    }
  });

  test("leave links within the site and e-mail links in place", async () => {
    const html = await page(path);
    const local = html
      .querySelectorAll("body a[href]")
      .filter(
        (a) =>
          !/^https?:/.test(a.getAttribute("href")!) || a.getAttribute("href")!.startsWith(site),
      );
    for (const a of local) expect(a.getAttribute("target"), a.getAttribute("href")).toBeUndefined();
  });
});
