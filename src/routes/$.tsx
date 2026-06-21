import { createFileRoute } from "@tanstack/react-router";

import { NotFoundPage, notFoundHead } from "#/components/not-found-page";

/** Catch-all for unknown paths — localized 404 with correct head metadata. */
export const Route = createFileRoute("/$")({
  head: () => notFoundHead(),
  component: NotFoundPage,
});
