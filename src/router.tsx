import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { initBotId } from "botid/client/core";
import { routeTree } from "./routeTree.gen";
import { deLocalizeUrl, localizeUrl } from "./paraglide/runtime";

// Register the contact server function endpoint for BotID. The client attaches
// challenge headers only to declared paths; server functions POST to
// /_serverFn/<id>, so protect the whole prefix. Browser-only (no-op on server).
if (typeof window !== "undefined") {
  initBotId({
    protect: [{ path: "/_serverFn/*", method: "POST" }],
  });
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    // Map locale-prefixed external URLs (/fr/about) to canonical internal
    // routes (/about), and localize generated hrefs back on output.
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
