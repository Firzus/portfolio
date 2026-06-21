import { z } from "zod";

/**
 * GitHub live activity layer. Pulls real profile stats and recent public
 * activity from the GitHub REST API so the home page can highlight genuine
 * GitHub presence (no screenshots). The network call lives in `server.ts`;
 * this module owns the boundary schemas and the normalization that the UI
 * consumes, kept pure so it can be unit-tested without the network.
 */

/** Subset of GitHub event types we surface, with a stable display kind. */
export type ActivityKind =
  | "push"
  | "pr"
  | "issue"
  | "create"
  | "fork"
  | "star"
  | "release"
  | "other";

export type GitHubActivity = {
  id: string;
  kind: ActivityKind;
  /** `owner/name` of the repository the event targets. */
  repo: string;
  /** URL to the repository. */
  repoUrl: string;
  /** ISO timestamp of the event. */
  createdAt: string;
};

export type GitHubProfile = {
  username: string;
  name: string | null;
  htmlUrl: string;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
};

export type GitHubHighlight = {
  profile: GitHubProfile;
  activity: GitHubActivity[];
};

/** Boundary schema for the `/users/{username}` response (fields we use). */
export const githubUserSchema = z.object({
  login: z.string(),
  name: z.string().nullable().optional(),
  html_url: z.url(),
  avatar_url: z.url(),
  bio: z.string().nullable().optional(),
  public_repos: z.number(),
  followers: z.number(),
  following: z.number(),
});

/** Boundary schema for a single `/users/{username}/events/public` entry. */
export const githubEventSchema = z.object({
  id: z.string(),
  type: z.string().nullable(),
  created_at: z.string(),
  repo: z.object({
    name: z.string(),
    url: z.string().optional(),
  }),
});

export const githubEventsSchema = z.array(githubEventSchema);

const EVENT_KIND: Record<string, ActivityKind> = {
  PushEvent: "push",
  PullRequestEvent: "pr",
  IssuesEvent: "issue",
  IssueCommentEvent: "issue",
  CreateEvent: "create",
  ForkEvent: "fork",
  WatchEvent: "star",
  ReleaseEvent: "release",
};

function kindFor(type: string | null): ActivityKind {
  if (!type) return "other";
  return EVENT_KIND[type] ?? "other";
}

export function toProfile(user: z.infer<typeof githubUserSchema>): GitHubProfile {
  return {
    username: user.login,
    name: user.name ?? null,
    htmlUrl: user.html_url,
    avatarUrl: user.avatar_url,
    bio: user.bio ?? null,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
  };
}

/**
 * Normalize raw public events into display activity, newest first. Collapses
 * consecutive events on the same repo+kind (e.g. a burst of pushes) into one
 * entry, and caps the list to `limit`.
 */
export function toActivity(
  events: z.infer<typeof githubEventsSchema>,
  limit = 6,
): GitHubActivity[] {
  const result: GitHubActivity[] = [];
  let lastSignature: string | null = null;

  for (const event of events) {
    const kind = kindFor(event.type);
    const repo = event.repo.name;
    const signature = `${kind}:${repo}`;
    if (signature === lastSignature) continue;
    lastSignature = signature;

    result.push({
      id: event.id,
      kind,
      repo,
      repoUrl: `https://github.com/${repo}`,
      createdAt: event.created_at,
    });

    if (result.length >= limit) break;
  }

  return result;
}
