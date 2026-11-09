import { createFileRoute } from "@tanstack/react-router";
import { AiAgentsPage } from "../components/AiAgentsPage";
import { m } from "../paraglide/messages.js";

// Declared under the French path only; Paraglide's URL patterns map /en/ai-agents to it.
export const Route = createFileRoute("/agents-ia")({
  head: () => ({
    meta: [
      { title: m.agents_meta_title() },
      { name: "description", content: m.agents_meta_description() },
    ],
  }),
  component: AiAgentsPage,
});
