import { m } from "../paraglide/messages.js";
import { projectHref } from "./projects";

/**
 * The commit of agent-skills the quotes and counts were read at, so each source link shows the
 * text as it was quoted even after the repository changes.
 */
const agentSkillsCommit = "b090af668bf381a982b47ae4ba71775494a4b1b0";
const agentSkills = "https://github.com/Firzus/agent-skills";
const portfolio = "https://github.com/Firzus/portfolio";

export const agentSkillsRepository = agentSkills;

const agentSkillsFile = (path: string): Source => ({
  href: `${agentSkills}/blob/${agentSkillsCommit}/${path}`,
  name: `agent-skills/${path}`,
});

export interface Source {
  href: string;
  /** File, pull request or repository, by its own name. */
  name: string;
}

export interface SourcedFigure {
  value: string;
  label: () => string;
  source: Source;
}

export interface ToolLink {
  href: string;
  type: () => string;
  label: () => string;
}

export interface PortfolioPull {
  number: number;
  issue: string;
  summary: () => string;
  /** Automated tests on the main branch once the pull request was merged. */
  tests: number;
}

export interface NotePicture {
  src: string;
  width: number;
  height: number;
  alt: () => string;
  caption: () => string;
  /** The page the capture shows, linked after the caption; read at render, as it may be localized. */
  source: () => Source;
}

export interface MethodChange {
  number: number;
  change: () => string;
  /** What the pull request itself declares it did not check or cover. */
  gap: () => string;
}

/**
 * One piece of a section, in reading order. Texts may set identifiers in backticks, shown as code.
 */
export type Block =
  | { kind: "text"; text: () => string }
  /** Quoted in English in the source; the message holds the page's language. */
  | { kind: "quote"; text: () => string; source: Source }
  | { kind: "figures"; items: SourcedFigure[] }
  | { kind: "tools"; items: ToolLink[] }
  | { kind: "request-path" }
  | { kind: "picture"; picture: NotePicture }
  | { kind: "portfolio-pulls"; items: PortfolioPull[] }
  | { kind: "method-changes"; items: MethodChange[] };

export interface NoteSection {
  /** Anchor of the section, the same in every language. */
  id: string;
  heading: () => string;
  /** Enough on its own for a quick read; the other sections are for engineers. */
  essential: boolean;
  blocks: Block[];
}

export interface RequestStep {
  title: () => string;
  detail: () => string;
}

/** The diagram of agent-skills' README, as an ordered list. */
export const requestPath = {
  steps: [
    { title: m.agents_step_request, detail: m.agents_step_request_detail },
    { title: m.agents_step_size, detail: m.agents_step_size_detail },
    { title: m.agents_step_interview, detail: m.agents_step_interview_detail },
    { title: m.agents_step_agreement, detail: m.agents_step_agreement_detail },
    { title: m.agents_step_build, detail: m.agents_step_build_detail },
    { title: m.agents_step_review, detail: m.agents_step_review_detail },
    { title: m.agents_step_show, detail: m.agents_step_show_detail },
    { title: m.agents_step_ship, detail: m.agents_step_ship_detail },
  ] satisfies RequestStep[],
  source: agentSkillsFile("README.md"),
};

const readme = agentSkillsFile("README.md");
const workSkill = agentSkillsFile("skills/stack/work/SKILL.md");
const operatingPolicy = agentSkillsFile(
  "skills/engineering/setup-harness/references/operating-policy.md",
);

export const portfolioPullHref = (number: number) => `${portfolio}/pull/${number}`;
export const agentSkillsPullHref = (number: number) => `${agentSkills}/pull/${number}`;

// A capture at 1000 by 625 CSS pixels, exported at twice that size, the shape of the project pictures.
const capture = (
  name: string,
  alt: () => string,
  caption: () => string,
  source: () => Source,
): Block => ({
  kind: "picture",
  picture: {
    src: `/images/ai-agents/${name}.avif`,
    width: 2000,
    height: 1250,
    alt,
    caption,
    source,
  },
});

const portfolioPull = (number: number): Source => ({
  href: portfolioPullHref(number),
  name: `portfolio#${number}`,
});

/** The sections of the note, in reading order. */
export const noteSections: NoteSection[] = [
  {
    id: "why",
    heading: m.agents_why_heading,
    essential: true,
    blocks: [
      { kind: "text", text: m.agents_why_1 },
      { kind: "quote", text: m.agents_why_quote, source: readme },
      { kind: "text", text: m.agents_why_2 },
      capture(
        "agent-skills-readme",
        m.agents_picture_readme_alt,
        m.agents_picture_readme_caption,
        () => readme,
      ),
    ],
  },
  {
    id: "origins",
    heading: m.agents_origins_heading,
    essential: false,
    blocks: [
      { kind: "text", text: m.agents_origins_1 },
      { kind: "text", text: m.agents_origins_2 },
      {
        kind: "tools",
        items: [
          {
            href: "https://github.com/Firzus/claude-code-to-cursor",
            type: m.agents_tool_type_proxy,
            label: m.agents_tool_claude_code_to_cursor,
          },
          {
            href: "https://github.com/Firzus/shim",
            type: m.agents_tool_type_proxy,
            label: m.agents_tool_shim,
          },
          {
            href: "https://github.com/Firzus/codex-cursor-proxy",
            type: m.agents_tool_type_proxy,
            label: m.agents_tool_codex_cursor_proxy,
          },
          {
            href: "https://github.com/Firzus/gemini-image-mcp",
            type: m.agents_tool_type_mcp,
            label: m.agents_tool_gemini_image_mcp,
          },
          {
            href: "https://github.com/Firzus/tauri-agent-kit",
            type: m.agents_tool_type_mcp,
            label: m.agents_tool_tauri_agent_kit,
          },
        ],
      },
      { kind: "text", text: m.agents_origins_3 },
    ],
  },
  {
    id: "request-path",
    heading: m.agents_path_heading,
    essential: true,
    blocks: [
      { kind: "text", text: m.agents_path_1 },
      { kind: "text", text: m.agents_path_2 },
      { kind: "request-path" },
      capture(
        "agent-skills-pull-182",
        m.agents_picture_pull_182_alt,
        m.agents_picture_pull_182_caption,
        () => ({ href: agentSkillsPullHref(182), name: "agent-skills#182" }),
      ),
      { kind: "quote", text: m.agents_path_quote, source: workSkill },
      { kind: "text", text: m.agents_path_3 },
    ],
  },
  {
    id: "memory",
    heading: m.agents_memory_heading,
    essential: false,
    blocks: [
      { kind: "text", text: m.agents_memory_1 },
      { kind: "text", text: m.agents_memory_2 },
      { kind: "quote", text: m.agents_memory_quote, source: workSkill },
      { kind: "text", text: m.agents_memory_3 },
    ],
  },
  {
    id: "evidence",
    heading: m.agents_evidence_heading,
    essential: false,
    blocks: [
      { kind: "text", text: m.agents_evidence_1 },
      { kind: "text", text: m.agents_evidence_2 },
      { kind: "quote", text: m.agents_evidence_quote, source: workSkill },
    ],
  },
  {
    id: "review",
    heading: m.agents_review_heading,
    essential: false,
    blocks: [
      { kind: "text", text: m.agents_review_1 },
      { kind: "text", text: m.agents_review_2 },
      { kind: "quote", text: m.agents_review_quote, source: operatingPolicy },
    ],
  },
  {
    id: "case-study",
    heading: m.agents_case_heading,
    essential: true,
    blocks: [
      { kind: "text", text: m.agents_case_1 },
      {
        kind: "figures",
        items: [
          { value: "18", label: m.agents_case_stat_first, source: portfolioPull(4) },
          { value: "143", label: m.agents_case_stat_now, source: portfolioPull(9) },
          {
            value: "3",
            label: m.agents_case_stat_prototypes,
            source: {
              href: `${portfolio}/branches/all?query=prototype`,
              name: "portfolio/branches",
            },
          },
        ],
      },
      {
        kind: "portfolio-pulls",
        items: [
          { number: 4, issue: "FIR-418", summary: m.agents_case_pull_4, tests: 18 },
          { number: 6, issue: "FIR-423", summary: m.agents_case_pull_6, tests: 50 },
          { number: 7, issue: "FIR-425", summary: m.agents_case_pull_7, tests: 66 },
          { number: 8, issue: "FIR-429", summary: m.agents_case_pull_8, tests: 66 },
          { number: 9, issue: "FIR-426", summary: m.agents_case_pull_9, tests: 143 },
        ],
      },
      capture(
        "portfolio-pull-9",
        m.agents_picture_pull_9_alt,
        m.agents_picture_pull_9_caption,
        () => portfolioPull(9),
      ),
      capture(
        "portfolio-atelier",
        m.agents_picture_atelier_alt,
        m.agents_picture_atelier_caption,
        () => ({ href: projectHref("atelier"), name: m.agents_picture_atelier_link() }),
      ),
      { kind: "text", text: m.agents_case_2 },
      { kind: "text", text: m.agents_case_3 },
    ],
  },
  {
    id: "evolution",
    heading: m.agents_evolution_heading,
    essential: false,
    blocks: [
      { kind: "text", text: m.agents_evolution_1 },
      {
        kind: "figures",
        items: [
          {
            value: "47",
            label: m.agents_evolution_stat_skills,
            source: {
              href: `${agentSkills}/tree/${agentSkillsCommit}/skills`,
              name: "agent-skills/skills",
            },
          },
          {
            value: "192",
            label: m.agents_evolution_stat_pulls,
            source: {
              href: `${agentSkills}/pulls?q=is%3Apr+is%3Amerged`,
              name: "agent-skills/pulls",
            },
          },
          {
            value: "235",
            label: m.agents_evolution_stat_commits,
            source: {
              href: `${agentSkills}/commits/${agentSkillsCommit}`,
              name: "agent-skills/commits",
            },
          },
        ],
      },
      { kind: "text", text: m.agents_evolution_2 },
      {
        kind: "method-changes",
        items: [
          { number: 112, change: m.agents_change_112, gap: m.agents_change_112_gap },
          { number: 127, change: m.agents_change_127, gap: m.agents_change_127_gap },
          { number: 170, change: m.agents_change_170, gap: m.agents_change_170_gap },
          { number: 182, change: m.agents_change_182, gap: m.agents_change_182_gap },
          { number: 185, change: m.agents_change_185, gap: m.agents_change_185_gap },
        ],
      },
      { kind: "text", text: m.agents_evolution_3 },
    ],
  },
];
