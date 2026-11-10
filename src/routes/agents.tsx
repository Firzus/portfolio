import { createFileRoute } from "@tanstack/react-router";
import { AiAgentsPage } from "../components/AiAgentsPage";
import { m } from "../paraglide/messages.js";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: m.agents_meta_title() },
      { name: "description", content: m.agents_meta_description() },
    ],
  }),
  component: AiAgentsPage,
});
