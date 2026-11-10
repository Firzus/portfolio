import { getRouteApi } from "@tanstack/react-router";
import { ArrowUpRight, Github } from "iconoir-react";
import { contact } from "../../content/contact";
import type { GithubActivityData } from "../../lib/github-activity-fn";
import { cn } from "../../lib/utils";
import { m } from "../../paraglide/messages.js";
import { getLocale } from "../../paraglide/runtime.js";
import { TextLink } from "../ui/text-link";

const phoneWeeks = 26;

/** Columns of seven days, Sunday first as on GitHub, with the empty days before the first one. */
function weeks(activity: GithubActivityData) {
  const first = new Date(`${activity.days[0]?.date}T00:00:00Z`);
  const padded = [...Array<undefined>(first.getUTCDay()).fill(undefined), ...activity.days];
  const columns: (typeof padded)[] = [];
  for (let i = 0; i < padded.length; i += 7) columns.push(padded.slice(i, i + 7));
  return columns;
}

/**
 * The month a column starts, when it differs from the previous column's. A month starting in the
 * last two columns has no room for its name.
 */
function monthStarts(columns: ReturnType<typeof weeks>, locale: string) {
  const format = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  let previous = -1;
  return columns.map((column, x) => {
    const day = column.find(Boolean);
    if (!day || x > columns.length - 3) return undefined;
    const date = new Date(`${day.date}T00:00:00Z`);
    const month = date.getUTCMonth();
    if (month === previous) return undefined;
    previous = month;
    return format.format(date);
  });
}

const home = getRouteApi("/");

/**
 * Lilian's public GitHub year, loaded by the home route (see lib/github-activity-fn.ts): the
 * calendar of contributions, coloured like GitHub's but in the site's palette, and the yearly
 * total. The calendar is decoration for the total, so assistive technology reads the total only.
 */
export function GithubActivity() {
  const activity = home.useLoaderData();
  const locale = getLocale();
  const columns = weeks(activity);
  const months = monthStarts(columns, locale);
  // A phone shows the last half-year only: the whole year would shrink each day to a few pixels.
  const phoneHidden = (x: number) => x < columns.length - phoneWeeks && "max-sm:hidden";
  return (
    <div data-slot="github-activity" className="mt-14 max-w-xl">
      <div className="flex items-center gap-2 text-caption text-muted">
        <Github aria-hidden="true" className="size-4" />
        <span>
          {m.home_github_label()} <span className="font-medium text-ink">@{activity.user}</span>
        </span>
        <TextLink href={contact.github} className="ml-auto gap-1">
          {m.home_github_profile()}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </TextLink>
      </div>
      <div aria-hidden="true" className="mt-3.5">
        <div
          data-slot="contribution-grid"
          className="grid auto-cols-fr grid-flow-col grid-rows-7 gap-0.5"
        >
          {columns.flatMap((column, x) =>
            column.map((day, y) =>
              day ? (
                <span
                  key={day.date}
                  data-level={day.level}
                  className={cn(
                    "aspect-square rounded-xs bg-ink/5 data-[level=1]:bg-deep/70 data-[level=2]:bg-deep data-[level=3]:bg-shader-mid data-[level=4]:bg-accent",
                    phoneHidden(x),
                  )}
                />
              ) : (
                <span key={`${x}-${y}`} className={cn(phoneHidden(x))} />
              ),
            ),
          )}
        </div>
        <div className="mt-1.5 grid auto-cols-fr grid-flow-col text-label tracking-normal text-muted">
          {months.map((month, x) => (
            <span key={x} className={cn("relative h-4", phoneHidden(x))}>
              {month && (
                // Node and the browser can word a short month differently; either is right.
                <span suppressHydrationWarning className="absolute left-0 whitespace-nowrap">
                  {month}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2.5">
        <span className="text-title font-heading tabular-nums">
          {activity.total.toLocaleString(locale)}
        </span>
        <span className="text-caption text-muted">{m.home_github_total()}</span>
      </p>
    </div>
  );
}
