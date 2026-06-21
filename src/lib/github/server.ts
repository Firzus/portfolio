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
 * Module-level cache. The unauthenticated GitHub API allows only 60 req/h per
 * IP and the home loader fires 2 requests per SSR render, so without caching a
 * shared/serverless IP exhausts the budget in ~30 renders. We memoize the
 * result for `CACHE_TTL_MS` (persists while a serverless instance stays warm)
 * and also cache `null` briefly so a rate-limit error doesn't hammer the API.
 */
const CACHE_TTL_MS = 10 * 60 * 1000;
const NULL_CACHE_TTL_MS = 60 * 1000;
let cache: { value: GitHubHighlight | null; expiresAt: number } | null = null;

async function loadHighlight(): Promise<GitHubHighlight | null> {
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
}

/**
 * Server function: fetch the live GitHub profile + recent public activity for
 * the configured user, cached with a short TTL. Returns `null` on any failure
 * (rate limit, network, malformed payload) so the section degrades to a simple
 * profile link instead of breaking the home page render.
 */
export const getGitHubHighlight = createServerFn({ method: "GET" }).handler(
  async (): Promise<GitHubHighlight | null> => {
    const now = Date.now();
    if (cache && cache.expiresAt > now) return cache.value;

    const value = await loadHighlight();
    cache = {
      value,
      expiresAt: now + (value ? CACHE_TTL_MS : NULL_CACHE_TTL_MS),
    };
    return value;
  },
);
