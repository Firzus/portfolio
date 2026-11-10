import { ArrowUp, ArrowUpRight } from "iconoir-react";
import type * as React from "react";
import { useEffect, useState } from "react";
import {
  agentSkillsPullHref,
  agentSkillsRepository,
  noteSections,
  portfolioPullHref,
  requestPath,
  type Block,
  type MethodChange,
  type NotePicture,
  type NoteSection,
  type PortfolioPull,
  type SourcedFigure,
  type ToolLink,
} from "../content/ai-agents";
import { gutter } from "../lib/layout";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";
import { ShaderLayer } from "./motion/shaders/ShaderLayer";
import type { Scene } from "./motion/shaders/scenes";
import { Band } from "./ui/band";
import { Chip } from "./ui/chip";
import { LinkButton } from "./ui/link-button";
import { PullQuote } from "./ui/pull-quote";
import { RowLink } from "./ui/row-link";
import { Stat } from "./ui/stat";
import { TextLink } from "./ui/text-link";
import { Thumbnail } from "./ui/thumbnail";

/** The research note on how Lilian works with coding agents, one band per section. */
export function AiAgentsPage() {
  return (
    <main>
      <NoteHero />
      <article>
        {noteSections.map((section) => (
          <NoteSectionBand key={section.id} section={section} />
        ))}
      </article>
      <TocReturn />
    </main>
  );
}

function NoteHero() {
  return (
    <section className="grid border-b border-line lg:grid-cols-5">
      <div className={cn(gutter, "py-14 md:py-20 lg:col-span-3")}>
        <h1 className="font-display text-display font-heading">{m.agents_title()}</h1>
        <p className="mt-5 text-small text-muted">{m.agents_kind()}</p>
        <p className="mt-6 max-w-2xl text-lead">{m.agents_lede()}</p>
        <p className="mt-5 max-w-2xl text-body text-muted">{m.agents_short_read()}</p>
        <div className="mt-9">
          <LinkButton href={agentSkillsRepository}>
            {m.agents_repository_link()}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </LinkButton>
        </div>
      </div>
      <TableOfContents />
    </section>
  );
}

function TableOfContents() {
  return (
    <nav
      aria-labelledby="toc-heading"
      className={cn(
        gutter,
        "border-line bg-surface py-10 max-lg:border-t md:py-14 lg:col-span-2 lg:border-l lg:py-20",
      )}
    >
      <h2 data-reveal id="toc-heading" className="font-display text-title font-heading">
        {m.agents_toc_label()}
      </h2>
      <ol className="mt-5 border-t border-line">
        {noteSections.map((section) => (
          <li key={section.id} className="border-b border-line">
            <a
              href={`#${section.id}`}
              className="flex items-baseline gap-4 rounded-sm py-3 transition-colors hover:text-accent motion-reduce:transition-none"
            >
              <span className="flex-1">{section.heading()}</span>
              {section.essential && <Chip>{m.agents_essential()}</Chip>}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * A way back to the contents, once they have scrolled out of view: the note is long and its
 * contents sit at the top only. Hidden and out of the tab order while the contents are on screen.
 */
function TocReturn() {
  const [away, setAway] = useState(false);
  useEffect(() => {
    const toc = document.getElementById("toc-heading")?.closest("nav");
    if (!toc) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setAway(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    });
    observer.observe(toc);
    return () => observer.disconnect();
  }, []);
  return (
    <a
      href="#toc-heading"
      data-toc-return
      data-state={away ? "shown" : "hidden"}
      inert={!away}
      className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-small font-medium transition hover:text-accent data-[state=hidden]:translate-y-2 data-[state=hidden]:opacity-0 motion-reduce:transition-none md:right-6 md:bottom-6"
    >
      <ArrowUp aria-hidden="true" className="size-4" />
      {m.agents_toc_return()}
    </a>
  );
}

function NoteSectionBand({ section }: { section: NoteSection }) {
  const headingId = `${section.id}-heading`;
  return (
    <Band id={section.id} aria-labelledby={headingId}>
      <div className="grid gap-8 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-2">
          <h2 data-reveal id={headingId} className="font-display text-head font-heading">
            {section.heading()}
          </h2>
          {section.essential && <Chip className="mt-4">{m.agents_essential()}</Chip>}
        </div>
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-3">
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
      return <p className="max-w-2xl text-body text-muted">{withCode(block.text())}</p>;
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
    case "picture":
      return <NoteFigure picture={block.picture} />;
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
      <code key={index} className="rounded-sm bg-surface px-1 py-0.5 text-small text-ink">
        {part}
      </code>
    ) : (
      part
    ),
  );
}

function Figures({ items }: { items: SourcedFigure[] }) {
  return (
    <dl className="grid gap-6 border-y border-line py-6 sm:grid-cols-3">
      {items.map((figure) => (
        <Stat
          key={figure.source.href}
          value={figure.value}
          label={
            <>
              {figure.label()}
              <TextLink variant="accent" href={figure.source.href} className="mt-1 block w-fit">
                {figure.source.name}
              </TextLink>
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
        <li key={tool.href} data-reveal>
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

/** The step drops take the intent icons' mixes in turn, so neighbouring steps differ. */
const stepScenes: Scene[] = [
  "icon-agents",
  "icon-tools",
  "icon-play",
  "icon-contact",
  "icon-unity",
];

function RequestPath() {
  return (
    <figure
      data-request-path
      data-reveal
      className="rounded-xl border border-line bg-surface p-4 md:p-6"
    >
      <ol className="grid gap-3 sm:grid-cols-2">
        {requestPath.steps.map((step, index) => (
          <li
            key={step.title()}
            data-reveal
            data-step
            className="flex gap-3 rounded-lg border border-line bg-ground p-4"
          >
            {/* The same drop as the home page's intent icons: a changing shape filled with a
                live shader, the number crisp above it. */}
            <span
              aria-hidden="true"
              data-drop
              className="relative isolate grid size-9 shrink-0 place-items-center overflow-hidden text-caption font-semibold tabular-nums"
            >
              <ShaderLayer scene={stepScenes[index % stepScenes.length]!} className="-z-10" />
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
        <TextLink variant="accent" href={requestPath.source.href}>
          {requestPath.source.name}
        </TextLink>
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
          <li key={pull.number} data-reveal>
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
          <li key={change.number} data-reveal className="flex gap-4 border-b border-line py-4">
            <TextLink
              variant="accent"
              href={agentSkillsPullHref(change.number)}
              aria-label={`agent-skills#${change.number}`}
              className="w-12 shrink-0 text-caption tabular-nums"
            >
              #{change.number}
            </TextLink>
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

function NoteFigure({ picture }: { picture: NotePicture }) {
  const source = picture.source();
  return (
    <figure data-reveal>
      <Thumbnail
        src={picture.src}
        alt={picture.alt()}
        width={picture.width}
        height={picture.height}
      />
      <figcaption className="mt-3 text-caption text-muted">
        {withCode(picture.caption())}{" "}
        <TextLink variant="accent" href={source.href}>
          {source.name}
        </TextLink>
      </figcaption>
    </figure>
  );
}
