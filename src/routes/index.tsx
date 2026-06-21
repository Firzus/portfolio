import { createFileRoute } from "@tanstack/react-router";

import { Hero } from "#/components/hero";
import { SiteHeader } from "#/components/site-header";
import * as m from "#/paraglide/messages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: m.meta_title() },
      {
        name: "description",
        content: m.meta_description(),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
}
