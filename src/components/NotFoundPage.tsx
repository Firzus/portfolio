import { Link } from "@tanstack/react-router";
import { gutter } from "../lib/layout";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";
import { textLinkVariants } from "./ui/text-link";

export function NotFoundPage() {
  return (
    <main className={cn(gutter, "flex flex-col gap-6 py-24")}>
      <h1 className="font-display text-head font-heading">{m.not_found_title()}</h1>
      <p>
        <Link to="/" className={textLinkVariants({ variant: "accent" })}>
          {m.not_found_home()}
        </Link>
      </p>
    </main>
  );
}
