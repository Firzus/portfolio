import { HeadContent, Scripts, createRootRoute, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import { ThemeProvider } from "#/components/theme-provider";
import { themeInitScript } from "#/lib/theme";
import { baseLocale, getLocale, localizeHref, locales, shouldRedirect } from "#/paraglide/runtime";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  // Offline-safe locale redirect: the SSR middleware handles this on the
  // server, this covers client-side navigations that bypass the network.
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const decision = await shouldRedirect({ url: window.location.href });
    if (decision.redirectUrl) {
      throw redirect({ href: decision.redirectUrl.href });
    }
  },
  head: ({ match }) => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Portfolio — Firzus",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // hreflang alternates for every locale + x-default pointing at baseLocale.
      // React canonical prop is `hrefLang`; it renders to the lowercase
      // `hreflang` attribute that crawlers read.
      ...locales.map((locale) => ({
        rel: "alternate",
        hrefLang: locale,
        href: localizeHref(match.pathname, { locale }),
      })),
      {
        rel: "alternate",
        hrefLang: "x-default",
        href: localizeHref(match.pathname, { locale: baseLocale }),
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <script
          // No-FOUC: resolve and apply theme before first paint.
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
