import { gutter } from "../lib/layout";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";

export function HomePage() {
  return (
    <main className={cn(gutter, "py-24 md:py-32")}>
      <h1 className="font-display text-display font-semibold">Lilian PRIEU</h1>
      <p className="mt-4 text-lead text-muted">{m.job_title()}</p>
    </main>
  );
}
