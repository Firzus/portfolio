import {
  HeadContent,
  Scripts,
  createRootRoute,
  isNotFound,
  rootRouteId,
  useLocation,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { NotFoundPage } from "../components/NotFoundPage";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { defaultPage, localizedPages } from "../lib/site";
import { m } from "../paraglide/messages.js";
import { getLocale } from "../paraglide/runtime.js";
import appCss from "../styles/global.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: m.meta_title() },
      { name: "description", content: m.meta_description() },
    ],
    links: [
      // Preloaded so the text is not first drawn in the fallback face.
      {
        rel: "preload",
        href: "/fonts/rubik.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
});

function RootDocument({ children }: { children: ReactNode }) {
  const locale = getLocale();
  // The router's location has no locale prefix (see the rewrite in router.tsx).
  const pathname = useLocation({ select: (location) => location.pathname });
  const notFound = useRouterState({
    // Either no route matched the URL, so only the root remains, or a route
    // threw notFound().
    select: (state) =>
      state.matches.at(-1)?.routeId === rootRouteId ||
      state.matches.some((match) => isNotFound(match.error)),
  });
  // A missing page has no version in another language to point to.
  const pages = notFound ? [] : localizedPages(pathname);
  const fallback = defaultPage(pages);

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
        {pages.map((page) => (
          <link key={page.locale} rel="alternate" hrefLang={page.locale} href={page.absoluteHref} />
        ))}
        {fallback && <link rel="alternate" hrefLang="x-default" href={fallback.absoluteHref} />}
      </head>
      <body className="bg-field font-sans text-body text-ink antialiased">
        <div className="md:px-2">
          <div className="mx-auto flex min-h-svh max-w-column flex-col border-x border-line bg-ground">
            <SiteHeader pages={pages} currentLocale={locale} />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
