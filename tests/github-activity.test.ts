import { parse } from "node-html-parser";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { parseContributions } from "../scripts/github-activity";
import activity from "../src/content/github-activity.json";
import { startServer, type RunningServer } from "./server";

describe("reading GitHub's public contributions page", () => {
  const html = `
    <h2 id="js-contribution-activity-description" class="f4">
      5,273  contributions
      in the last year
    </h2>
    <table><tbody>
      <tr><td data-date="2025-11-10" id="d1" data-level="2" class="ContributionCalendar-day"></td></tr>
      <tr><td data-date="2025-11-09" id="d0" data-level="0" class="ContributionCalendar-day"></td></tr>
      <tr><td data-date="2025-11-11" id="d2" data-level="4" class="ContributionCalendar-day"></td></tr>
    </tbody></table>`;

  test("takes the yearly total and every day's level, in date order", () => {
    expect(parseContributions(html)).toEqual({
      total: 5273,
      days: [
        { date: "2025-11-09", level: 0 },
        { date: "2025-11-10", level: 2 },
        { date: "2025-11-11", level: 4 },
      ],
    });
  });

  test("refuses a page it cannot read rather than saving an empty year", () => {
    expect(() => parseContributions("<html></html>")).toThrow();
  });
});

describe("the GitHub block of the home page", () => {
  let server: RunningServer;
  beforeAll(async () => {
    server = await startServer();
  });
  afterAll(() => server?.stop());

  const block = async (path: string) => {
    const response = await fetch(new URL(path, server.origin));
    return parse(await response.text()).querySelector("[data-slot=github-activity]");
  };

  test.each([
    ["/", "fr-FR", "contributions sur les 12 derniers mois"],
    ["/en/", "en-US", "contributions in the last 12 months"],
  ])("on %s shows the saved year", async (path, locale, label) => {
    const el = await block(path);
    expect(el?.querySelector("a[href='https://github.com/Firzus']")).toBeTruthy();
    expect(el?.text).toContain(activity.total.toLocaleString(locale));
    expect(el?.text).toContain(label);
    const cells = el?.querySelectorAll("[data-level]") ?? [];
    expect(cells.map((c) => c.getAttribute("data-level"))).toEqual(
      activity.days.map((day) => String(day.level)),
    );
  });

  test("replaces the three figures of the hero", async () => {
    const response = await fetch(new URL("/", server.origin));
    const html = parse(await response.text());
    expect(html.querySelector("section dl [data-slot=stat]")).toBeNull();
  });
});
