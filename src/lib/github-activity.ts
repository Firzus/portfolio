export interface Contributions {
  total: number;
  days: { date: string; level: number }[];
}

const query = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionLevel } }
      }
    }
  }
}`;

/** GitHub's five shades of a day, from no contribution to the busiest quarter of the year. */
const levels: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

interface CalendarAnswer {
  errors?: { message: string }[];
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: { contributionDays: { date: string; contributionLevel: string }[] }[];
        };
      };
    } | null;
  };
}

/**
 * Reads the last year's calendar from a GraphQL answer. Anything unexpected throws, so a caller
 * keeps the calendar it has rather than showing an empty or partial year.
 */
export function readCalendar(answer: CalendarAnswer): Contributions {
  if (answer.errors?.length) {
    throw new Error(`GitHub refused the query: ${answer.errors.map((e) => e.message).join("; ")}`);
  }
  const calendar = answer.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error("GitHub's answer has no contribution calendar.");
  const days = calendar.weeks
    .flatMap((week) => week.contributionDays)
    .map((day) => {
      const level = levels[day.contributionLevel];
      if (level === undefined) throw new Error(`Unknown level ${day.contributionLevel}.`);
      return { date: day.date, level };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  if (days.length === 0) throw new Error("GitHub's calendar has no days.");
  return { total: calendar.totalContributions, days };
}

/** Asks GitHub's GraphQL API, which refuses anonymous queries, for a user's last year. */
export async function fetchContributions({
  user,
  token,
  fetch = globalThis.fetch,
}: {
  user: string;
  token: string;
  fetch?: (url: string, init: RequestInit) => Promise<Response>;
}): Promise<Contributions> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ query, variables: { login: user } }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`GitHub answered ${response.status}.`);
  return readCalendar((await response.json()) as CalendarAnswer);
}

/**
 * A value that is never awaited by its readers: `get` answers at once with the last value, and
 * starts one background `load` when that value is older than `maxAge`. A failed load keeps the
 * value and is tried again after `retryAfter`, so an unreachable source is not asked on every read.
 */
export function createRefreshingCache<T>({
  initial,
  load,
  maxAge,
  retryAfter,
  now = Date.now,
}: {
  initial: T;
  load: () => Promise<T>;
  maxAge: number;
  retryAfter: number;
  now?: () => number;
}) {
  let value = initial;
  let nextLoad = -Infinity;
  let pending: Promise<void> | undefined;

  return {
    get(): T {
      if (!pending && now() >= nextLoad) {
        pending = load().then(
          (fresh) => {
            value = fresh;
            nextLoad = now() + maxAge;
          },
          (error: unknown) => {
            console.error("Keeping the last GitHub calendar:", error);
            nextLoad = now() + retryAfter;
          },
        );
        void pending.finally(() => (pending = undefined));
      }
      return value;
    },
    /** Resolves once the background load, if any, has ended. */
    async settled() {
      await pending;
    },
  };
}
