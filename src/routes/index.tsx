import { createFileRoute } from "@tanstack/react-router";

import { About } from "#/components/about";
import { FeaturedProjects } from "#/components/featured-projects";
import { GitHubActivity } from "#/components/github-activity";
import { Hero } from "#/components/hero";
import { SiteHeader } from "#/components/site-header";
import { Skills } from "#/components/skills";
import { Testimonials } from "#/components/testimonials";
import { getProjects } from "#/lib/content/server";
import { getGitHubHighlight } from "#/lib/github/server";
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
  loader: async () => {
    const [projects, github] = await Promise.all([
      getProjects({ data: { locale: getLocale() } }),
      getGitHubHighlight(),
    ]);
    return { projects, github };
  },
  component: Home,
});

function Home() {
  const { projects, github } = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeaturedProjects projects={projects} />
        <About />
        <Skills />
        <GitHubActivity highlight={github} />
        <Testimonials />
      </main>
    </div>
  );
}
