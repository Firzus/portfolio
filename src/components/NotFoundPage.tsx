import { Link } from "@tanstack/react-router";
import { gutter } from "../lib/layout";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";

export function NotFoundPage() {
  return (
    <main className={cn(gutter, "flex flex-col gap-6 py-24")}>
      <h1 className="font-display text-head font-semibold">{m.not_found_title()}</h1>
      <p>
        <Link to="/" className="text-accent underline-offset-4 hover:underline">
          {m.not_found_home()}
        </Link>
      </p>
    </main>
  );
}
