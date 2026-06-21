import { createFileRoute } from "@tanstack/react-router";
import type { Config } from "@keystatic/core";
import { Keystatic } from "@keystatic/core/ui";

import keystaticConfig from "../../keystatic.config";

// Client-only Admin UI. Keystatic ships a React SPA that owns its own internal
// routing under /keystatic, so we disable SSR and mount it on a splat route.
export const Route = createFileRoute("/keystatic/$")({
  ssr: false,
  component: KeystaticAdmin,
});

function KeystaticAdmin() {
  // `keystaticConfig` is a precisely-inferred Config; the UI accepts the
  // general `Config` shape, so widen it here.
  return <Keystatic config={keystaticConfig as Config} />;
}
