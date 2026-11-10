import { createServerFn } from "@tanstack/react-start";
import saved from "../content/github-activity.json";
import { createRefreshingCache, fetchContributions, type Contributions } from "./github-activity";

let cache: ReturnType<typeof createRefreshingCache<Contributions>> | undefined;

/**
 * The GitHub calendar of the home page, refreshed by the server once a week from GitHub's API.
 * Starts from the copy saved in the repository, which also stays in use without a GITHUB_TOKEN
 * or while GitHub cannot be reached.
 */
export const getGithubActivity = createServerFn({ method: "GET" }).handler(() => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { user: saved.user, total: saved.total, days: saved.days };
  cache ??= createRefreshingCache<Contributions>({
    initial: { total: saved.total, days: saved.days },
    load: () => fetchContributions({ user: saved.user, token }),
    maxAge: 7 * 24 * 3600 * 1000,
    retryAfter: 3600 * 1000,
  });
  return { user: saved.user, ...cache.get() };
});

export type GithubActivityData = Awaited<ReturnType<typeof getGithubActivity>>;
