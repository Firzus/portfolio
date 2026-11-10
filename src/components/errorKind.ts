export type ErrorKind = "offline" | "updated" | "error";

// How Chrome, Safari and Firefox word a failed `import()`: after a deploy, a tab still running
// the previous version asks for scripts that the server no longer has.
const missingScript =
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

/** What went wrong, so the error page can say it plainly and offer the right way out. */
export function errorKind(error: unknown, online: boolean): ErrorKind {
  if (!online) return "offline";
  if (error instanceof Error && missingScript.test(error.message)) return "updated";
  return "error";
}
