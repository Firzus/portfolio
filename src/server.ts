import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "./paraglide/server.js";

export default createServerEntry({
  // The handler receives the original request: the router removes the locale
  // from the URL itself, and the middleware's de-localized request would loop.
  fetch(request) {
    return paraglideMiddleware(request, () => handler.fetch(request));
  },
});
