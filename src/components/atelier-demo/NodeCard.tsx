import { NavArrowDown, Xmark } from "iconoir-react";
import type * as React from "react";
import { cn } from "../../lib/utils";
import { m } from "../../paraglide/messages.js";
import { getLocale } from "../../paraglide/runtime.js";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "../ui/collapsible";

interface NodeCardProps {
  title: string;
  summary?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Removes the node; absent for the trigger, which a behaviour always has. */
  onRemove?: () => void;
  defaultOpen?: boolean;
  /** A condition inside a Check Conditions sits in the card's recess. */
  nested?: boolean;
  /** Set while the run is held at this node. */
  running?: boolean;
  children?: React.ReactNode;
}

/** One node of the Inspector: a header that folds its fields away, as Atelier draws it. */
export function NodeCard({
  title,
  summary,
  Icon,
  onRemove,
  defaultOpen = false,
  nested = false,
  running = false,
  children,
}: NodeCardProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      data-running={running || undefined}
      className={cn(
        "rounded-md",
        nested ? "bg-editor-recess" : "bg-editor-card",
        "data-running:bg-editor-running",
      )}
    >
      <div className="flex items-center gap-1 pr-1">
        <CollapsibleTrigger className="group flex min-w-0 flex-1 items-center gap-2 rounded-md p-1.5 text-left hover:bg-editor-card-hover">
          <span className="grid size-6 shrink-0 place-items-center rounded-sm bg-editor-control/60">
            <Icon aria-hidden="true" className="size-3.5" />
          </span>
          <span data-node-title className="truncate font-semibold">
            {title}
          </span>
          {summary && <span className="truncate text-editor-muted">{summary}</span>}
          <NavArrowDown
            aria-hidden="true"
            className="ml-auto size-3.5 shrink-0 text-editor-muted group-data-panel-open:rotate-180"
          />
        </CollapsibleTrigger>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={m.demo_remove({ name: title })}
            lang={getLocale()}
            className="grid size-6 shrink-0 place-items-center rounded-sm text-editor-muted hover:bg-editor-card-hover hover:text-editor-ink"
          >
            <Xmark aria-hidden="true" className="size-3.5" />
          </button>
        )}
      </div>
      {children && (
        <CollapsiblePanel className="flex flex-col gap-1.5 border-t border-editor-line p-2">
          {children}
        </CollapsiblePanel>
      )}
    </Collapsible>
  );
}
