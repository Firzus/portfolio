import { createFileRoute } from "@tanstack/react-router";

import { Button } from "#/components/ui/button";
import { ThemeToggle } from "#/components/theme-toggle";
import { LocaleSwitcher } from "#/components/locale-switcher";
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
      <header className="flex items-center justify-between p-6">
        <span className="text-sm font-semibold tracking-tight">{m.nav_brand()}</span>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {m.hero_role()}
        </p>
        <h1 className="text-5xl font-bold tracking-tight">{m.hero_title()}</h1>
        <p className="max-w-md text-lg text-muted-foreground">{m.hero_subtitle()}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button>{m.cta_contact()}</Button>
          <Button variant="outline">{m.cta_projects()}</Button>
        </div>
      </main>
    </div>
  );
}
