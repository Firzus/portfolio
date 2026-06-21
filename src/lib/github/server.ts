import { createServerFn } from "@tanstack/react-start";

import { siteConfig } from "#/lib/site-config";

import {
  type GitHubHighlight,
  githubEventsSchema,
  githubUserSchema,
  toActivity,
  toProfile,
} from "./github";

const GITHUB_API = "https://api.github.com";

/** Shared headers; include a token when present to lift the 60 req/h limit. */
function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-firzus",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(`${GITHUB_API}${path}`, { headers: githubHeaders() });
  if (!response.ok) {
    throw new Error(`GitHub API ${path} responded ${response.status}`);
  }
  return response.json();
}

/**
 * Server function: fetch the live GitHub profile + recent public activity for
 * the configured user. Returns `null` on any failure (rate limit, network,
 * malformed payload) so the section degrades to a simple profile link instead
 * of breaking the home page render.
 */
export const getGitHubHighlight = createServerFn({ method: "GET" }).handler(
  async (): Promise<GitHubHighlight | null> => {
    const username = siteConfig.githubUsername;
    try {
      const [rawUser, rawEvents] = await Promise.all([
        fetchJson(`/users/${username}`),
        fetchJson(`/users/${username}/events/public?per_page=30`),
      ]);

      const user = githubUserSchema.parse(rawUser);
      const events = githubEventsSchema.parse(rawEvents);

      return {
        profile: toProfile(user),
        activity: toActivity(events),
      };
    } catch {
      return null;
    }
  },
);
