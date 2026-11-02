import { readFile } from "node:fs/promises";
import { parse, type HTMLElement } from "node-html-parser";
import { describe, expect, test } from "vite-plus/test";

const site = "https://portfolio.lprieu.dev";

async function page(path: string): Promise<HTMLElement> {
  const file = new URL(`../dist${path}index.html`, import.meta.url);
  return parse(await readFile(file, "utf8"));
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

describe.each(pages)("$path", ({ path, lang, texts, switchTo }) => {
  test(`declares lang="${lang}"`, async () => {
    const html = await page(path);
    expect(html.querySelector("html")?.getAttribute("lang")).toBe(lang);
  });

  test("shows the name, the job title and the localized interface texts", async () => {
    const html = await page(path);
    expect(html.querySelector("h1")?.text).toBe("Lilian PRIEU");
    expect(html.querySelector("main p")?.text).toBe("Software Engineer");
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

  test("lists the three contact links", async () => {
    const html = await page(path);
    const hrefs = html.querySelectorAll("[data-contact]").map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual([
      "https://www.linkedin.com/in/lprieu/",
      "mailto:lprieu.infos@gmail.com",
      "https://github.com/Firzus",
    ]);
    expect(html.querySelectorAll("[data-contact] svg")).toHaveLength(3);
  });
});

test("depends on no React package", async () => {
  const lockfile = await readFile(new URL("../pnpm-lock.yaml", import.meta.url), "utf8");
  expect(lockfile).not.toMatch(/^\s+'?(@[\w-]+\/)?react(-dom)?@/m);
});
