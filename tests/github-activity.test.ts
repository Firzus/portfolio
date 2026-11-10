import { parse } from "node-html-parser";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import {
  createRefreshingCache,
  fetchContributions,
  readCalendar,
} from "../src/lib/github-activity";
import activity from "../src/content/github-activity.json";
import { startServer, type RunningServer } from "./server";

const calendar = {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: 5273,
          weeks: [
            {
              contributionDays: [
                { date: "2025-11-10", contributionLevel: "SECOND_QUARTILE" },
                { date: "2025-11-09", contributionLevel: "NONE" },
              ],
            },
            { contributionDays: [{ date: "2025-11-11", contributionLevel: "FOURTH_QUARTILE" }] },
          ],
        },
      },
    },
  },
};

describe("reading GitHub's contribution calendar", () => {
  test("takes the yearly total and every day's level, in date order", () => {
    expect(readCalendar(calendar)).toEqual({
      total: 5273,
      days: [
        { date: "2025-11-09", level: 0 },
        { date: "2025-11-10", level: 2 },
        { date: "2025-11-11", level: 4 },
      ],
    });
  });

  test("refuses an answer without a calendar rather than showing an empty year", () => {
    expect(() => readCalendar({ errors: [{ message: "Bad credentials" }] })).toThrow(
      /Bad credentials/,
    );
    expect(() => readCalendar({ data: { user: null } })).toThrow();
  });

  test("asks GitHub's GraphQL API for the user's calendar, with the token", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fake = async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return Response.json(calendar);
    };
    const result = await fetchContributions({ user: "Firzus", token: "t0ken", fetch: fake });
    expect(result.total).toBe(5273);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("https://api.github.com/graphql");
    expect(new Headers(calls[0]?.init.headers).get("authorization")).toBe("Bearer t0ken");
    expect(JSON.parse(calls[0]?.init.body as string).variables).toEqual({ login: "Firzus" });
  });

  test("reports a refused request with GitHub's status", async () => {
    const fake = async () => new Response("", { status: 401 });
    await expect(fetchContributions({ user: "Firzus", token: "x", fetch: fake })).rejects.toThrow(
      /401/,
    );
  });
});

describe("the weekly copy of the calendar kept by the server", () => {
  const week = 7 * 24 * 3600 * 1000;
  const hour = 3600 * 1000;

  function setup(load: () => Promise<string>) {
    let time = 0;
    let loads = 0;
    const cache = createRefreshingCache({
      initial: "saved",
      maxAge: week,
      retryAfter: hour,
      now: () => time,
      load: () => {
        loads++;
        return load();
      },
    });
    return {
      cache,
      advance: (ms: number) => (time += ms),
      loads: () => loads,
    };
  }

  test("answers at once with what it has, and refreshes it in the background", async () => {
    const { cache, loads } = setup(async () => "fresh");
    expect(cache.get()).toBe("saved");
    expect(cache.get()).toBe("saved");
    expect(loads()).toBe(1);
    await cache.settled();
    expect(cache.get()).toBe("fresh");
  });

  test("asks GitHub again only once the copy is a week old", async () => {
    const { cache, advance, loads } = setup(async () => "fresh");
    cache.get();
    await cache.settled();
    advance(week - 1);
    cache.get();
    expect(loads()).toBe(1);
    advance(2);
    cache.get();
    expect(loads()).toBe(2);
  });

  test("keeps the last copy when GitHub fails, and tries again an hour later", async () => {
    const { cache, advance, loads } = setup(async () => {
      throw new Error("down");
    });
    cache.get();
    await cache.settled();
    expect(cache.get()).toBe("saved");
    advance(hour - 1);
    cache.get();
    expect(loads()).toBe(1);
    advance(2);
    cache.get();
    expect(loads()).toBe(2);
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
