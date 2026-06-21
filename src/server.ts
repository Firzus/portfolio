import handler from "@tanstack/react-start/server-entry";

import { paraglideMiddleware } from "./paraglide/server.js";

export default {
  // Paraglide resolves the locale (URL prefix, cookie, base locale) and sets
  // the AsyncLocalStorage context. TanStack Router itself handles URL
  // de/localization via the `rewrite` option, so we pass the ORIGINAL request
  // to the handler — using the middleware's delocalized request would cause a
  // redirect loop (both layers would strip the locale prefix).
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, () => handler.fetch(req));
  },
};
