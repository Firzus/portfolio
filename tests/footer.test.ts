import { parse } from "node-html-parser";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { nameMark } from "../src/components/motion/lettering";
import { startServer, type RunningServer } from "./server";

let server: RunningServer;
beforeAll(async () => {
  server = await startServer();
});
afterAll(() => server?.stop());

const footer = async (path: string) => {
  const response = await fetch(new URL(path, server.origin));
  return parse(await response.text()).querySelector("footer");
};

describe.each([
  { path: "/", label: "Plan du site", links: ["Accueil", "Projets", "Agents"] },
  { path: "/en/agents", label: "Site map", links: ["Home", "Projects", "Agents"] },
])("the footer on $path", ({ path, label, links }) => {
  test("ends the page on Lilian's name, large, in the loading screen's hand lettering", async () => {
    const mark = (await footer(path))?.querySelector("[data-footer-name] svg[data-slot=name-mark]");
    expect(mark?.getAttribute("aria-hidden")).toBe("true");
    expect(mark?.querySelector("path")?.getAttribute("d")).toBe(nameMark.d);
  });

  test("repeats the site's sections in a navigation of its own", async () => {
    const nav = (await footer(path))?.querySelector("nav");
    expect(nav?.getAttribute("aria-label")).toBe(label);
    expect(nav?.querySelectorAll("a").map((a) => a.text.trim())).toEqual(links);
  });

  test("sits over a liquid shader, hidden from assistive technology", async () => {
    const scene = (await footer(path))?.querySelector("[data-scene]");
    expect(scene?.getAttribute("aria-hidden")).toBe("true");
  });
});
