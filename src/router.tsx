import { createRouter } from "@tanstack/react-router";
import { ErrorPage } from "./components/ErrorPage";
import { deLocalizeUrl, localizeUrl } from "./paraglide/runtime.js";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    // Shown inside the site's frame, in place of a page that failed to load or render.
    defaultErrorComponent: ErrorPage,
    // Routes are declared once, without locale: Paraglide maps `/en/…` to `/…`
    // on the way in and back on the way out.
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
  });
}
