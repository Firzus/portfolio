import { ArrowRight, ArrowUpRight, Brain, Gamepad, Mail, Puzzle, Tools } from "iconoir-react";
import type * as React from "react";
import { contact } from "../../content/contact";
import { findProject, projectHref } from "../../content/projects";
import { m } from "../../paraglide/messages.js";
import { ShaderLayer, useHover } from "../motion/shaders/ShaderLayer";
import type { Scene } from "../motion/shaders/scenes";
import { localizeHref } from "../../paraglide/runtime.js";
import { Band } from "../ui/band";
import { ProvisionalMark } from "../ui/provisional-mark";
import { RowLink, RowPlaceholder } from "../ui/row-link";

interface Row {
  key: string;
  type: string;
  label: string;
  /** Absent while the destination does not exist yet; the row is then marked provisional. */
  href?: string;
  external?: boolean;
}

interface Intent {
  key: string;
  scene: Scene;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tag: string;
  question: string;
  rows: Row[];
}

function projectRow(slug: string): Row {
  return {
    key: `${slug}-project`,
    type: m.row_type_project(),
    label: m.intent_project_row({ name: findProject(slug).name }),
    href: projectHref(slug),
  };
}

function intents(): Intent[] {
  return [
    {
      key: "play",
      scene: "icon-play",
      Icon: Gamepad,
      tag: m.intent_play_tag(),
      question: m.intent_play_question(),
      rows: [
        {
          key: "lysandra-demo",
          type: m.row_type_demo(),
          label: m.intent_play_demo(),
          href: findProject("lysandra").site,
          external: true,
        },
        projectRow("lysandra"),
      ],
    },
    {
      key: "tools",
      scene: "icon-tools",
      Icon: Tools,
      tag: m.intent_tools_tag(),
      question: m.intent_tools_question(),
      rows: [
        {
          key: "huzounet-site",
          type: m.row_type_site(),
          label: m.intent_tools_site(),
          href: findProject("huzounet").site,
          external: true,
        },
        projectRow("huzounet"),
      ],
    },
    {
      key: "unity",
      scene: "icon-unity",
      Icon: Puzzle,
      tag: m.intent_unity_tag(),
      question: m.intent_unity_question(),
      rows: [
        projectRow("atelier"),
        {
          key: "atelier-repository",
          type: m.row_type_repository(),
          label: m.intent_unity_repository(),
        },
      ],
    },
    {
      key: "agents",
      scene: "icon-agents",
      Icon: Brain,
      tag: m.intent_agents_tag(),
      question: m.intent_agents_question(),
      rows: [
        {
          key: "agents-note",
          type: m.row_type_note(),
          label: m.intent_agents_row(),
          href: localizeHref("/agents-ia"),
        },
      ],
    },
    {
      key: "contact",
      scene: "icon-contact",
      Icon: Mail,
      tag: m.intent_contact_tag(),
      question: m.intent_contact_question(),
      rows: [
        {
          key: "email",
          type: m.contact_email(),
          label: contact.email.replace(/^mailto:/, ""),
          href: contact.email,
        },
        {
          key: "linkedin",
          type: m.row_type_profile(),
          label: m.contact_linkedin(),
          href: contact.linkedin,
          external: true,
        },
        {
          key: "github",
          type: m.row_type_profile(),
          label: m.contact_github(),
          href: contact.github,
          external: true,
        },
        { key: "cv", type: m.row_type_cv(), label: m.intent_contact_cv() },
      ],
    },
  ];
}

/** The links sorted by what the visitor wants to do, each row going straight to its destination. */
export function IntentLinks() {
  return (
    <Band aria-labelledby="intents-heading">
      <div className="lg:pl-24">
        <h2 id="intents-heading" data-reveal className="font-display text-head font-heading">
          {m.home_paths_heading()}
        </h2>
        <p className="mt-4 max-w-md text-body text-muted">{m.home_paths_intro()}</p>
      </div>
      <div className="mt-14 flex flex-col gap-14">
        {intents().map((intent) => (
          <IntentBlock key={intent.key} intent={intent} />
        ))}
      </div>
    </Band>
  );
}

function IntentBlock({ intent }: { intent: Intent }) {
  const { Icon } = intent;
  const { hover, bind } = useHover();
  return (
    <div {...bind} data-intent className="group/intent grid gap-6 lg:grid-cols-5 lg:gap-16">
      <div className="flex gap-5 lg:col-span-2">
        {/* A drop that slowly changes shape, filled with a live shader, under a crisp pictogram
            that lifts while the block is hovered. */}
        <div
          aria-hidden="true"
          data-drop
          className="relative isolate grid size-14 shrink-0 place-items-center overflow-hidden"
        >
          <ShaderLayer scene={intent.scene} hover={hover} className="-z-10" />
          <Icon
            aria-hidden="true"
            className="size-7 transition-transform duration-500 ease-out group-hover/intent:-translate-y-0.5 group-hover/intent:scale-110 motion-reduce:transition-none"
          />
        </div>
        <div>
          <p className="text-caption font-medium text-muted">{intent.tag}</p>
          <h3 className="mt-1 font-display text-title">{intent.question}</h3>
        </div>
      </div>
      <ul className="border-t border-line lg:col-span-3">
        {intent.rows.map((row) => (
          <li key={row.key} data-intent-row={row.key} data-reveal>
            <IntentRow row={row} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function IntentRow({ row }: { row: Row }) {
  const type = <span className="w-20 shrink-0 text-caption text-muted">{row.type}</span>;
  if (!row.href) {
    return (
      <RowPlaceholder>
        {type}
        <span className="flex-1">
          {row.label}
          <ProvisionalMark />
        </span>
      </RowPlaceholder>
    );
  }
  const Arrow = row.external ? ArrowUpRight : ArrowRight;
  return (
    <RowLink href={row.href}>
      {type}
      <span className="flex-1">{row.label}</span>
      <Arrow aria-hidden="true" className="size-4 text-muted group-hover:text-accent" />
    </RowLink>
  );
}
