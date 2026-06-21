import { ArrowLeft } from "lucide-react";

import { SiteHeader } from "#/components/site-header";
import { buildPageHead } from "#/lib/seo/meta";
import { localizeHref } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

/** Shared, localized 404 shell used by the root route and route-level handlers. */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main id="main" className="flex flex-1 items-center justify-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
          <p
            className="text-sm font-medium uppercase tracking-widest text-accent-gold"
            aria-hidden="true"
          >
            404
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{m.not_found_title()}</h1>
          <p className="text-pretty text-muted-foreground">{m.not_found_body()}</p>
          <a
            href={localizeHref("/")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-gold transition-colors hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {m.not_found_cta()}
          </a>
        </div>
      </main>
    </div>
  );
}

/** Head entries for global and route-level 404 responses. */
export function notFoundHead() {
  const page = buildPageHead({
    title: m.not_found_title(),
    description: m.not_found_body(),
    pathname: "/404",
  });
  return {
    ...page,
    meta: [...page.meta, { name: "robots", content: "noindex" }],
  };
}
