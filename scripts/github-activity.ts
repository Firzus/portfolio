// Refreshes src/content/github-activity.json, the copy of Lilian's GitHub calendar that the home
// page starts from and keeps showing when the server has no GITHUB_TOKEN or GitHub is unreachable:
// `GITHUB_TOKEN=<token> node scripts/github-activity.ts`. The token needs no permission.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fetchContributions } from "../src/lib/github-activity.ts";

const user = "Firzus";
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("Set GITHUB_TOKEN: GitHub's GraphQL API refuses anonymous queries.");

const activity = { user, ...(await fetchContributions({ user, token })) };
const file = join(import.meta.dirname, "..", "src", "content", "github-activity.json");
writeFileSync(file, `${JSON.stringify(activity)}\n`);
console.log(`Saved ${activity.total} contributions over ${activity.days.length} days.`);
