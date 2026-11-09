import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "./paraglide/server.js";

// `/en/projets/…` falls through Paraglide's catch-all pattern and would serve the English project
// page under a second address; it moves permanently to the translated segment.
const frenchSegmentUnderEnglish = "/en/projets/";

export default createServerEntry({
  // The handler receives the original request: the router removes the locale
  // from the URL itself, and the middleware's de-localized request would loop.
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith(frenchSegmentUnderEnglish)) {
      const rest = url.pathname.slice(frenchSegmentUnderEnglish.length);
      return new Response(null, {
        status: 301,
        headers: { location: `/en/projects/${rest}${url.search}` },
      });
    }
    return paraglideMiddleware(request, () => handler.fetch(request));
  },
});
