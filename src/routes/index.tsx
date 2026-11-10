import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "../components/HomePage";
import { getGithubActivity } from "../lib/github-activity-fn";

export const Route = createFileRoute("/")({
  loader: () => getGithubActivity(),
  component: HomePage,
});
