import {
  Activity as ActivityIcon,
  ArrowUpRight,
  CircleDot,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  Github,
  Package,
  Plus,
  Star,
} from "lucide-react";

import { Button } from "#/components/ui/button";
import type { ActivityKind, GitHubHighlight } from "#/lib/github/github";
import { siteConfig } from "#/lib/site-config";
import { getLocale } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

type GitHubActivityProps = {
  highlight: GitHubHighlight | null;
};

const kindIcon: Record<ActivityKind, typeof GitCommitHorizontal> = {
  push: GitCommitHorizontal,
  pr: GitPullRequest,
  issue: CircleDot,
  create: Plus,
  fork: GitFork,
  star: Star,
  release: Package,
  other: ActivityIcon,
};

const kindLabel: Record<ActivityKind, () => string> = {
  push: m.github_activity_push,
  pr: m.github_activity_pr,
  issue: m.github_activity_issue,
  create: m.github_activity_create,
  fork: m.github_activity_fork,
  star: m.github_activity_star,
  release: m.github_activity_release,
  other: m.github_activity_other,
};

/** Format an ISO timestamp as a localized relative time ("3 days ago"). */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSeconds = Math.round((then - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: "auto" });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return rtf.format(diffSeconds, "second");
}

export function GitHubActivity({ highlight }: GitHubActivityProps) {
  return (
    <section id="github" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-accent-gold">
          {m.github_eyebrow()}
        </p>
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {m.github_title()}
        </h2>
        <p className="max-w-2xl text-pretty text-muted-foreground">{m.github_subtitle()}</p>
      </div>

      {highlight ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <ProfileCard highlight={highlight} />
          <ActivityCard highlight={highlight} />
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-start gap-4 rounded-xl border border-dashed border-border bg-card/50 p-8">
          <p className="text-sm text-muted-foreground">{m.github_unavailable()}</p>
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={siteConfig.social.github} target="_blank" rel="noreferrer noopener" />}
          >
            <Github className="size-4" />
            {m.github_view_profile()}
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
      )}
    </section>
  );
}

function ProfileCard({ highlight }: { highlight: GitHubHighlight }) {
  const { profile } = highlight;
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        <img
          src={profile.avatarUrl}
          alt=""
          width={56}
          height={56}
          loading="lazy"
          className="size-14 rounded-full border border-border"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold">{profile.name ?? profile.username}</p>
          <p className="truncate text-sm text-muted-foreground">@{profile.username}</p>
        </div>
      </div>

      {profile.bio ? (
        <p className="text-pretty text-sm text-muted-foreground">{profile.bio}</p>
      ) : null}

      <dl className="grid grid-cols-3 gap-3 text-center">
        <Stat value={profile.publicRepos} label={m.github_repos()} />
        <Stat value={profile.followers} label={m.github_followers()} />
        <Stat value={profile.following} label={m.github_following()} />
      </dl>

      <Button
        variant="outline"
        nativeButton={false}
        className="w-full"
        render={<a href={profile.htmlUrl} target="_blank" rel="noreferrer noopener" />}
      >
        <Github className="size-4" />
        {m.github_view_profile()}
        <ArrowUpRight className="size-4" />
      </Button>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-3">
      <dd className="text-xl font-bold tracking-tight">{value}</dd>
      <dt className="mt-0.5 text-xs text-muted-foreground">{label}</dt>
    </div>
  );
}

function ActivityCard({ highlight }: { highlight: GitHubHighlight }) {
  const { activity } = highlight;

  if (activity.length === 0) {
    return (
      <div className="flex items-center rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">{m.github_unavailable()}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold tracking-tight text-muted-foreground">
        {m.github_activity_title()}
      </h3>
      <ul className="mt-4 divide-y divide-border/60">
        {activity.map((item) => {
          const Icon = kindIcon[item.kind];
          return (
            <li key={item.id}>
              <a
                href={item.repoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center gap-3 py-3 transition-colors hover:text-accent-gold"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-gold" />
                <span className="min-w-0 flex-1">
                  <span className="text-sm text-muted-foreground">{kindLabel[item.kind]()} </span>
                  <span className="font-medium">{item.repo}</span>
                </span>
                <time dateTime={item.createdAt} className="shrink-0 text-xs text-muted-foreground">
                  {relativeTime(item.createdAt)}
                </time>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
