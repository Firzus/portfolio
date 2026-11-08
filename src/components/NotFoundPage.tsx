import { Link } from "@tanstack/react-router";
import { m } from "../paraglide/messages.js";

export function NotFoundPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-24">
      <h1 className="font-display text-4xl font-semibold tracking-tight">{m.not_found_title()}</h1>
      <p>
        <Link to="/" className="text-accent underline-offset-4 hover:underline">
          {m.not_found_home()}
        </Link>
      </p>
    </main>
  );
}
