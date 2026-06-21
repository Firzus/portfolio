import { createFileRoute } from "@tanstack/react-router";

import { FeaturedProjects } from "#/components/featured-projects";
import { Hero } from "#/components/hero";
import { SiteHeader } from "#/components/site-header";
import { getProjects } from "#/lib/content/server";
import { getLocale } from "#/paraglide/runtime";
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
  loader: () => getProjects({ data: { locale: getLocale() } }),
  component: Home,
});

function Home() {
  const projects = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeaturedProjects projects={projects} />
      </main>
    </div>
  );
}
