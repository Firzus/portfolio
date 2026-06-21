import { makeGenericAPIRouteHandler } from "@keystatic/core/api/generic";
import { createFileRoute } from "@tanstack/react-router";

import keystaticConfig from "../../keystatic.config";

// Framework-agnostic Keystatic API handler. TanStack Start has no first-party
// Keystatic adapter, so we bridge the generic handler (which accepts a
// Request-like object and returns `{ body, ...ResponseInit }`) to a standard
// Response. The Admin UI at /keystatic talks to these endpoints.
const handler = makeGenericAPIRouteHandler({ config: keystaticConfig });

async function handle({ request }: { request: Request }): Promise<Response> {
  const { body, ...init } = await handler(request);
  return new Response(body as BodyInit | null, init);
}

export const Route = createFileRoute("/api/keystatic/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
