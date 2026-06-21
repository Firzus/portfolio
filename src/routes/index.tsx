import { createFileRoute } from "@tanstack/react-router";

import { Button } from "#/components/ui/button";
import { ThemeToggle } from "#/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Firzus" },
      {
        name: "description",
        content: "Agentic / AI Developer portfolio. Server-rendered with TanStack Start.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between p-6">
        <span className="text-sm font-semibold tracking-tight">Firzus</span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Agentic / AI Developer
        </p>
        <h1 className="text-5xl font-bold tracking-tight">Hello</h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Portfolio scaffold running on TanStack Start with a Tailwind v4 + shadcn/ui design system.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button>Get in touch</Button>
          <Button variant="outline">View projects</Button>
        </div>
      </main>
    </div>
  );
}
