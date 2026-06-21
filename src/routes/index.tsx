import { createFileRoute } from "@tanstack/react-router";

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
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
        Agentic / AI Developer
      </p>
      <h1 className="text-5xl font-bold tracking-tight">Hello</h1>
      <p className="max-w-md text-lg text-neutral-500">
        Portfolio scaffold running on TanStack Start with server-side rendering.
      </p>
    </main>
  );
}
