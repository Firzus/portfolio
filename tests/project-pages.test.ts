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
  headings: ["Contexte", "Rôle", "Ce que j'ai construit", "Images", "Liens", "Autres projets"],
};
const english = {
  lang: "en",
  prefix: "/en/projects/",
  other: { prefix: "/projets/", locale: "fr", label: "Français" },
  home: "/en/",
  headings: ["Context", "Role", "What I built", "Pictures", "Links", "Other projects"],
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
        // A brand logo beside the project's name is decoration, marked so with an empty alt.
        if (!picture.closest("[data-atelier-stage]")) {
          expect(picture.getAttribute("alt")).toMatch(/\S/);
        }
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

describe.each([
  { path: "/projets/lysandra", alt: "Lyra", art: "Illustration de Lysandra" },
  { path: "/en/projects/lysandra", alt: "Lyra", art: "Lysandra artwork" },
])("$path, Lysandra's stage", ({ path, alt, art }) => {
  test("opens on Lyra's artwork with its own background, without a shader", async () => {
    const html = await page(path);
    const hero = html.querySelector("main > section");
    const stage = hero?.querySelector("[data-project-stage]");
    const lyra = stage?.querySelector("img");
    expect(lyra?.getAttribute("src")).toBe("/images/projects/lysandra/lyra.avif");
    expect(lyra?.getAttribute("alt")).toContain(alt);
    expect(stage?.querySelector("[data-scene]")).toBeNull();
    expect(hero?.querySelectorAll("img")).toHaveLength(1);
    expect(hero?.querySelector("[data-slot='provisional-mark']")).toBeNull();
  });

  test("keeps the game's artwork among the pictures", async () => {
    const html = await page(path);
    const artwork = html.querySelector(
      "main [aria-labelledby=pictures-heading] img[src='/images/projects/lysandra/cover.avif']",
    );
    expect(artwork?.getAttribute("alt")).toContain(art);
  });
});

test.each([
  { path: "/projets/lysandra", value: "1 251", label: "installations de la démo" },
  { path: "/en/projects/lysandra", value: "1,251", label: "demo installs" },
])("counts the installs of Lysandra's demo on $path", async ({ path, value, label }) => {
  const stats = (await page(path)).querySelectorAll("main > section [data-slot=stat]");
  const found = stats.map((stat) => [
    stat.querySelector("dd")?.text.trim(),
    stat.querySelector("dt")?.text.trim(),
  ]);
  expect(found).toContainEqual([value, label]);
});

test("shows no provisional picture on the Lysandra pages", async () => {
  for (const path of ["/projets/lysandra", "/en/projects/lysandra"]) {
    const html = await page(path);
    expect(html.querySelectorAll("main [data-slot='provisional-mark']")).toHaveLength(0);
    const sources = html.querySelectorAll("main img").map((img) => img.getAttribute("src"));
    expect(sources.filter((src) => src?.includes("placeholders"))).toEqual([]);
  }
});

describe.each([
  {
    path: "/projets/lysandra",
    roles: { carousel: "carrousel", slide: "diapositive" },
    slides: ["1 sur 3", "2 sur 3", "3 sur 3"],
    controls: ["Image précédente", "Image suivante"],
  },
  {
    path: "/en/projects/lysandra",
    roles: { carousel: "carousel", slide: "slide" },
    slides: ["1 of 3", "2 of 3", "3 of 3"],
    controls: ["Previous picture", "Next picture"],
  },
])("$path, Lysandra's picture carousel", ({ path, roles, slides, controls }) => {
  test("is a labelled carousel of the game's three illustrations", async () => {
    const html = await page(path);
    const carousel = html.querySelector("main [data-slot=carousel]");
    expect(carousel?.getAttribute("role")).toBe("region");
    expect(carousel?.getAttribute("aria-roledescription")).toBe(roles.carousel);
    const heading = html.getElementById(carousel?.getAttribute("aria-labelledby") ?? "");
    expect(heading?.tagName).toBe("H2");
    const found = carousel?.querySelectorAll("[data-slot=carousel-slide]") ?? [];
    expect(found.map((slide) => slide.getAttribute("aria-label"))).toEqual(slides);
    expect(found.map((slide) => slide.querySelector("img")?.getAttribute("src"))).toEqual([
      "/images/projects/lysandra/cover.avif",
      "/images/projects/lysandra/lyra-slime.avif",
      "/images/projects/lysandra/lyra-boss.avif",
    ]);
    for (const slide of found) {
      expect(slide.getAttribute("role")).toBe("group");
      expect(slide.getAttribute("aria-roledescription")).toBe(roles.slide);
      // A list item cannot also be a group: the slides are plain blocks.
      expect(slide.tagName).toBe("DIV");
      expect(slide.querySelector("img")?.getAttribute("alt")).toMatch(/\S/);
    }
  });

  test("scrolls with the keyboard and offers named controls", async () => {
    const html = await page(path);
    const carousel = html.querySelector("main [data-slot=carousel]");
    expect(carousel?.querySelector("[data-slot=carousel-viewport]")?.getAttribute("tabindex")).toBe(
      "0",
    );
    const buttons = carousel?.querySelectorAll("button") ?? [];
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual(controls);
    // The end of the row is announced without disabling the button, which would drop its focus.
    expect(buttons.map((button) => button.getAttribute("aria-disabled"))).toEqual([
      "true",
      "false",
    ]);
    expect(buttons.some((button) => button.hasAttribute("disabled"))).toBe(false);
  });
});

test.each(["/projets/huzounet", "/projets/atelier"])(
  "keeps the picture grid on %s, without a carousel",
  async (path) => {
    const html = await page(path);
    expect(html.querySelector("main [data-slot=carousel]")).toBeNull();
    expect(
      html.querySelectorAll("main [aria-labelledby=pictures-heading] li img").length,
    ).toBeGreaterThan(0);
  },
);

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

describe.each([
  { path: "/projets/atelier", press: "Appuyer sur E", reset: "Réinitialiser" },
  { path: "/en/projects/atelier", press: "Press E", reset: "Reset" },
])("$path, Atelier's interactive Inspector", ({ path, press, reset }) => {
  test("is rendered by the server in its starting state, in Atelier's own English", async () => {
    const html = await page(path);
    const demo = html.querySelector("main [data-atelier-demo]");
    expect(demo).not.toBeNull();
    const inspector = demo?.querySelector("[data-atelier-inspector]");
    expect(inspector?.getAttribute("lang")).toBe("en");
    const titles = inspector
      ?.querySelectorAll("[data-node-title]")
      .map((title) => title.text.trim());
    expect(titles).toEqual(["On Input Button", "Check Conditions", "Is Active", "Set Active"]);
  });

  test("offers the controls to try it, named in the page's language", async () => {
    const html = await page(path);
    const buttons = html
      .querySelectorAll("main [data-atelier-demo] button")
      .map((button) => button.text.trim() || button.getAttribute("aria-label"));
    expect(buttons).toEqual(expect.arrayContaining([press, reset]));
    const unnamed = html
      .querySelectorAll("main [data-atelier-demo] button")
      .filter((button) => !button.text.trim() && !button.getAttribute("aria-label"));
    expect(unnamed).toEqual([]);
  });

  test("replaces the captures it reproduces, and keeps the custom condition's", async () => {
    const html = await page(path);
    const sources = html.querySelectorAll("main img").map((img) => img.getAttribute("src"));
    expect(sources).not.toContain("/images/projects/atelier/behaviour.avif");
    expect(sources).not.toContain("/images/projects/atelier/node-picker.avif");
    expect(sources).toContain("/images/projects/atelier/custom-node.avif");
  });
});

describe.each(["/projets/atelier", "/en/projects/atelier"])("%s, Atelier's branding", (path) => {
  test("opens on Atelier's logo over its signature gradient, the demo further down", async () => {
    const html = await page(path);
    const hero = html.querySelector("main > section");
    const logo = hero?.querySelector("[data-atelier-stage] img");
    expect(logo?.getAttribute("src")).toBe(
      "/images/projects/atelier/brand/atelier-lockup-vertical.svg",
    );
    expect(logo?.getAttribute("alt")).toBe("");
    // A live shader of the brand colours flows behind the logo, over the gradient as its fill.
    const scene = hero?.querySelector("[data-atelier-stage] [data-scene=atelier]");
    expect(scene?.getAttribute("aria-hidden")).toBe("true");
    expect(hero?.querySelector("[data-atelier-demo]")).toBeNull();
    expect(
      html.querySelector("main [aria-labelledby=demo-heading] [data-atelier-demo]"),
    ).toBeTruthy();
  });

  test("shows the Inspector first and keeps the invitation to try it discreet", async () => {
    const demo = (await page(path)).querySelector("main [data-atelier-demo]");
    const first = demo?.querySelector(":scope > *");
    expect(first?.querySelector("[data-atelier-inspector]")).toBeTruthy();
    expect(demo?.querySelector("[data-demo-hint]")?.getAttribute("class")).toContain(
      "text-caption",
    );
  });
});
