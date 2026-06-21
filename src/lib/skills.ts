/**
 * Static skills catalogue, grouped by category. Skill names are proper nouns
 * (technologies, tools) and stay in English across locales; only the group
 * headings are localized, via the Paraglide message keys referenced here.
 *
 * Intentionally no proficiency levels or skill bars — the issue calls for a
 * categorized list, not self-rated percentages.
 */
export type SkillGroupKey =
  | "skills_group_languages"
  | "skills_group_frontend"
  | "skills_group_backend"
  | "skills_group_ai"
  | "skills_group_gamedev"
  | "skills_group_tooling";

export type SkillGroup = {
  /** Paraglide message key resolving the localized group heading. */
  labelKey: SkillGroupKey;
  /** Technology names, displayed verbatim in every locale. */
  items: readonly string[];
};

export const skillGroups: readonly SkillGroup[] = [
  {
    labelKey: "skills_group_languages",
    items: ["TypeScript", "JavaScript", "Python", "C#", "C++", "SQL"],
  },
  {
    labelKey: "skills_group_frontend",
    items: ["React", "TanStack Start", "TailwindCSS", "Vite", "HTML", "CSS"],
  },
  {
    labelKey: "skills_group_backend",
    items: ["Node.js", "Server Functions", "Resend", "Zod", "REST APIs"],
  },
  {
    labelKey: "skills_group_ai",
    items: ["Agentic workflows", "LLM tooling", "Cursor", "Codex", "MCP", "Prompt engineering"],
  },
  {
    labelKey: "skills_group_gamedev",
    items: ["Unity", "Unreal Engine", "Shaders", "Game design"],
  },
  {
    labelKey: "skills_group_tooling",
    items: ["Git", "GitHub", "Docker", "Vercel", "CI/CD", "Keystatic"],
  },
] as const;
