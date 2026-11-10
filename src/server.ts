import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "./paraglide/server.js";

// Addresses that move permanently. A French segment under `/en/` falls through Paraglide's
// catch-all pattern and would serve the English page under a second address; the agents page
// moved from /agents-ia and /en/ai-agents, which links already shared still point to.
const moved: [from: string, to: string][] = [
  ["/en/projets/", "/en/projects/"],
  ["/en/agents-ia", "/en/agents"],
  ["/en/ai-agents", "/en/agents"],
  ["/agents-ia", "/agents"],
];

function newAddress(pathname: string): string | undefined {
  for (const [from, to] of moved) {
    const isPrefix = from.endsWith("/");
    if (isPrefix ? pathname.startsWith(from) : pathname === from) {
      return to + pathname.slice(from.length);
    }
  }
  return undefined;
}

export default createServerEntry({
  // The handler receives the original request: the router removes the locale
  // from the URL itself, and the middleware's de-localized request would loop.
  fetch(request) {
    const url = new URL(request.url);
    const target = newAddress(url.pathname);
    if (target) {
      return new Response(null, {
        status: 301,
        headers: { location: `${target}${url.search}` },
      });
    }
    return paraglideMiddleware(request, () => handler.fetch(request));
  },
});
