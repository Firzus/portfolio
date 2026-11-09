import { createRouter } from "@tanstack/react-router";
import { deLocalizeUrl, localizeUrl } from "./paraglide/runtime.js";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    // Router links animate like plain links, which use cross-document view transitions.
    defaultViewTransition: true,
    // Routes are declared once, without locale: Paraglide maps `/en/…` to `/…`
    // on the way in and back on the way out.
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
  });
}
