import { HeadContent, Scripts, createRootRoute, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import { ThemeProvider } from "#/components/theme-provider";
import { themeInitScript } from "#/lib/theme";
import * as m from "#/paraglide/messages";
import { getLocale, shouldRedirect } from "#/paraglide/runtime";
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
  // hreflang/canonical are emitted per-route via `buildPageHead`, which knows
  // the real pathname (the root match's pathname is always `/`) and each page's
  // genuine locale availability.
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: m.meta_title(),
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
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
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          {m.skip_to_content()}
        </a>
        <ThemeProvider>
          {children}
          {import.meta.env.DEV ? (
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
          ) : null}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
