import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "./paraglide/server.js";

// A French segment under `/en/` falls through Paraglide's catch-all pattern and would serve the
// English page under a second address; it moves permanently to the translated segment.
const frenchSegmentsUnderEnglish: [french: string, english: string][] = [
  ["/en/projets/", "/en/projects/"],
  ["/en/agents-ia", "/en/ai-agents"],
];

function translatedSegment(pathname: string): string | undefined {
  for (const [french, english] of frenchSegmentsUnderEnglish) {
    const isPrefix = french.endsWith("/");
    if (isPrefix ? pathname.startsWith(french) : pathname === french) {
      return english + pathname.slice(french.length);
    }
  }
  return undefined;
}

export default createServerEntry({
  // The handler receives the original request: the router removes the locale
  // from the URL itself, and the middleware's de-localized request would loop.
  fetch(request) {
    const url = new URL(request.url);
    const translated = translatedSegment(url.pathname);
    if (translated) {
      return new Response(null, {
        status: 301,
        headers: { location: `${translated}${url.search}` },
      });
    }
    return paraglideMiddleware(request, () => handler.fetch(request));
  },
});
