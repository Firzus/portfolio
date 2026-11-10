import { parse } from "node-html-parser";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { errorKind } from "../src/components/errorKind";
import { startServer, type RunningServer } from "./server";

describe("the kind of a page error", () => {
  test("is offline when the browser has no connection, whatever failed", () => {
    expect(errorKind(new Error("anything"), false)).toBe("offline");
  });

  test.each([
    "Failed to fetch dynamically imported module: https://x/assets/a.js",
    "Importing a module script failed.",
    "error loading dynamically imported module: https://x/assets/a.js",
  ])("is an update when a script of the previous version is gone: %s", (message) => {
    expect(errorKind(new Error(message), true)).toBe("updated");
  });

  test("is a plain error otherwise", () => {
    expect(errorKind(new Error("Cannot read properties of undefined"), true)).toBe("error");
    expect(errorKind("not an error", true)).toBe("error");
  });
});

describe("the page that does not exist", () => {
  let server: RunningServer;
  beforeAll(async () => {
    server = await startServer();
  });
  afterAll(() => server?.stop());

  test.each([
    ["/page-inconnue", "Retour à l'accueil", "Voir les projets"],
    ["/en/unknown-page", "Back to the home page", "See the projects"],
  ])("%s shows the error screen with its code and two ways back", async (path, home, projects) => {
    const response = await fetch(new URL(path, server.origin));
    const html = parse(await response.text());
    const screen = html.querySelector("main[data-error-screen=not-found]");
    expect(screen?.querySelector("[data-error-code]")?.text.trim()).toBe("404");
    const actions = screen?.querySelectorAll("a").map((a) => a.text.trim());
    expect(actions).toEqual([home, projects]);
  });
});
