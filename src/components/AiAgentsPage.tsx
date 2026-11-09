import { ArrowUpRight } from "iconoir-react";
import type * as React from "react";
import {
  agentSkillsPullHref,
  agentSkillsRepository,
  noteSections,
  portfolioPullHref,
  requestPath,
  type Block,
  type MethodChange,
  type NoteSection,
  type PortfolioPull,
  type SourcedFigure,
  type ToolLink,
} from "../content/ai-agents";
import { gutter } from "../lib/layout";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";
import { Band } from "./ui/band";
import { Chip } from "./ui/chip";
import { LinkButton } from "./ui/link-button";
import { PullQuote } from "./ui/pull-quote";
import { RowLink } from "./ui/row-link";
import { Stat } from "./ui/stat";

const sourceLink =
  "rounded-sm text-accent underline-offset-4 transition-colors hover:underline motion-reduce:transition-none";

/** The research note on how Lilian works with coding agents, one band per section. */
export function AiAgentsPage() {
  return (
    <main>
      <NoteHero />
      <TableOfContents />
      <article>
        {noteSections.map((section, index) => (
          <NoteSectionBand key={section.id} section={section} number={index + 1} />
        ))}
      </article>
    </main>
  );
}

function NoteHero() {
  return (
    <section className={cn(gutter, "border-b border-line py-14 md:py-20")}>
      <p className="text-small text-muted">{m.agents_kind()}</p>
      <h1 className="mt-5 max-w-4xl font-display text-display font-heading">{m.agents_title()}</h1>
      <p className="mt-6 max-w-2xl text-lead">{m.agents_lede()}</p>
      <p className="mt-5 max-w-2xl text-body text-muted">{m.agents_short_read()}</p>
      <div className="mt-9">
        <LinkButton href={agentSkillsRepository}>
          {m.agents_repository_link()}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </LinkButton>
      </div>
    </section>
  );
}

function TableOfContents() {
  return (
    <nav aria-label={m.agents_toc_label()} className={cn(gutter, "border-b border-line py-10")}>
      <p className="text-label font-medium text-muted uppercase">{m.agents_toc_label()}</p>
      <ol className="mt-5 grid gap-x-10 border-t border-line md:grid-cols-2">
        {noteSections.map((section, index) => (
          <li key={section.id} className="border-b border-line">
            <a
              href={`#${section.id}`}
              className="group flex items-baseline gap-4 rounded-sm py-3 transition-colors hover:text-accent motion-reduce:transition-none"
            >
              <span className="w-6 shrink-0 text-caption text-muted tabular-nums">
                {sectionNumber(index + 1)}
              </span>
              <span className="flex-1">{section.heading()}</span>
              {section.essential && <Chip>{m.agents_essential()}</Chip>}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function sectionNumber(number: number): string {
  return String(number).padStart(2, "0");
}

function NoteSectionBand({ section, number }: { section: NoteSection; number: number }) {
  const headingId = `${section.id}-heading`;
  return (
    <Band id={section.id} aria-labelledby={headingId}>
      <div className="grid gap-8 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-2">
          <p className="text-caption text-muted tabular-nums">{sectionNumber(number)}</p>
          <h2 id={headingId} className="mt-2 font-display text-head font-heading">
            {section.heading()}
          </h2>
          {section.essential && <Chip className="mt-4">{m.agents_essential()}</Chip>}
        </div>
        <div className="flex max-w-2xl min-w-0 flex-col gap-8 lg:col-span-3">
          {section.blocks.map((block, index) => (
            <NoteBlock key={index} block={block} />
          ))}
        </div>
      </div>
    </Band>
  );
}

function NoteBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case "text":
      return <p className="text-body text-muted">{withCode(block.text())}</p>;
    case "quote":
      return (
        <PullQuote
          cite={block.source.href}
          source={block.source.name}
          note={m.agents_quote_note()}
          className="my-2"
        >
          {block.text()}
        </PullQuote>
      );
    case "figures":
      return <Figures items={block.items} />;
    case "tools":
      return <Tools items={block.items} />;
    case "request-path":
      return <RequestPath />;
    case "portfolio-pulls":
      return <PortfolioPulls items={block.items} />;
    case "method-changes":
      return <MethodChanges items={block.items} />;
  }
}

/** Sets the identifiers a text marks with backticks as code. */
function withCode(text: string): React.ReactNode[] {
  return text.split("`").map((part, index) =>
    index % 2 === 1 ? (
      <code key={index} className="rounded-sm bg-surface px-1 py-0.5 font-mono text-small text-ink">
        {part}
      </code>
    ) : (
      part
    ),
  );
}

function Figures({ items }: { items: SourcedFigure[] }) {
  return (
    <dl
      aria-label={m.agents_figures_label()}
      className="grid gap-6 border-y border-line py-6 sm:grid-cols-3"
    >
      {items.map((figure) => (
        <Stat
          key={figure.source.href}
          value={figure.value}
          label={
            <>
              {figure.label()}
              <a href={figure.source.href} className={cn(sourceLink, "mt-1 block w-fit")}>
                {figure.source.name}
              </a>
            </>
          }
        />
      ))}
    </dl>
  );
}

function Tools({ items }: { items: ToolLink[] }) {
  return (
    <ul className="border-t border-line">
      {items.map((tool) => (
        <li key={tool.href}>
          <RowLink href={tool.href}>
            <span className="w-14 shrink-0 text-caption text-muted">{tool.type()}</span>
            <span className="flex-1">{tool.label()}</span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 text-muted group-hover:text-accent"
            />
          </RowLink>
        </li>
      ))}
    </ul>
  );
}

function RequestPath() {
  return (
    <figure data-request-path className="rounded-xl border border-line bg-surface p-4 md:p-6">
      <ol className="grid gap-3 sm:grid-cols-2">
        {requestPath.steps.map((step, index) => (
          <li key={step.title()} className="flex gap-3 rounded-lg border border-line bg-ground p-4">
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-full bg-deep text-caption font-medium tabular-nums"
            >
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-ink">{step.title()}</p>
              <p className="mt-1 text-small text-muted">{withCode(step.detail())}</p>
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="mt-4 text-caption text-muted">
        {m.agents_path_caption()}{" "}
        <a href={requestPath.source.href} className={sourceLink}>
          {requestPath.source.name}
        </a>
      </figcaption>
    </figure>
  );
}

function PortfolioPulls({ items }: { items: PortfolioPull[] }) {
  return (
    <div>
      <h3 id="portfolio-pulls-heading" className="font-display text-title font-heading">
        {m.agents_case_pulls_label()}
      </h3>
      <ul aria-labelledby="portfolio-pulls-heading" className="mt-4 border-t border-line">
        {items.map((pull) => (
          <li key={pull.number}>
            <RowLink href={portfolioPullHref(pull.number)} className="flex-wrap">
              <span className="w-10 shrink-0 text-caption text-accent tabular-nums">
                #{pull.number}
              </span>
              <span className="min-w-0 flex-1">{pull.summary()}</span>
              <span className="text-caption text-muted tabular-nums">
                {pull.issue} · {m.agents_case_tests({ count: String(pull.tests) })}
              </span>
            </RowLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MethodChanges({ items }: { items: MethodChange[] }) {
  return (
    <div>
      <h3 id="method-changes-heading" className="font-display text-title font-heading">
        {m.agents_evolution_changes_label()}
      </h3>
      <ul aria-labelledby="method-changes-heading" className="mt-4 border-t border-line">
        {items.map((change) => (
          <li key={change.number} className="flex gap-4 border-b border-line py-4">
            <a
              href={agentSkillsPullHref(change.number)}
              aria-label={`agent-skills#${change.number}`}
              className={cn(sourceLink, "w-12 shrink-0 text-caption tabular-nums")}
            >
              #{change.number}
            </a>
            <div className="min-w-0 flex-1">
              <p className="text-body">{withCode(change.change())}</p>
              <p className="mt-1 text-small text-muted">
                {m.agents_evolution_gap()} {change.gap()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
