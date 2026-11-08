import { HeadContent, Scripts, createRootRoute, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
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
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  const locale = getLocale();
  // The router's location has no locale prefix (see the rewrite in router.tsx).
  const pages = localizedPages(useLocation({ select: (location) => location.pathname }));
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
      <body className="bg-surface font-sans text-ink antialiased">
        <header className="flex justify-end p-6">
          <LanguageSwitcher pages={pages} currentLocale={locale} />
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
