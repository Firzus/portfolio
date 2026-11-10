// Saves Lilian's public GitHub contributions of the last year into src/content/github-activity.json,
// which the home page shows. Run it to refresh the block: `node scripts/github-activity.ts`.
// The page is read when this runs, not when the site is visited, so the site makes no request to
// GitHub and still renders without scripts.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const user = "Firzus";

export interface Contributions {
  total: number;
  days: { date: string; level: number }[];
}

/**
 * Reads the contributions calendar GitHub serves on a profile. It is a page, not an API, so its
 * markup can change: anything unexpected throws rather than saving an empty or partial year.
 */
export function parseContributions(html: string): Contributions {
  const heading = /id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s+contributions/.exec(
    html,
  );
  const days = Array.from(
    html.matchAll(/<td\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*\bdata-level="([0-4])"/g),
    ([, date, level]) => ({ date: date!, level: Number(level) }),
  ).sort((a, b) => a.date.localeCompare(b.date));
  if (!heading || days.length === 0) {
    throw new Error("GitHub's contributions page no longer has the expected markup.");
  }
  return { total: Number(heading[1]!.replaceAll(",", "")), days };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const response = await fetch(`https://github.com/users/${user}/contributions`);
  if (!response.ok) throw new Error(`GitHub answered ${response.status}.`);
  const activity = { user, ...parseContributions(await response.text()) };
  const file = join(import.meta.dirname, "..", "src", "content", "github-activity.json");
  writeFileSync(file, `${JSON.stringify(activity)}\n`);
  console.log(`Saved ${activity.total} contributions over ${activity.days.length} days.`);
}
