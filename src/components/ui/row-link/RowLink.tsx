import type * as React from "react";
import { externalLinkProps, isExternal } from "../../../lib/site";
import { cn } from "../../../lib/utils";
import { usePour } from "../../motion/fluid";
import { NewTabNote } from "../new-tab-note";
import { rowLayout } from "./rowLayout";

/**
 * A row of a link list, closed by a hairline; a faint fill pours in from where the pointer enters.
 * The fill stays inside the row, square and flush with the hairlines, so it reads as the band
 * between two lines rather than a box laid over them. A link to another site opens in a new tab.
 */
export function RowLink({
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  ...props
}: React.ComponentProps<"a">) {
  const pour = usePour();
  return (
    <a
      data-slot="row-link"
      className={cn(
        rowLayout,
        "group relative isolate transition-colors hover:text-accent motion-reduce:transition-none",
        className,
      )}
      onPointerEnter={(e) => {
        pour.onPointerEnter(e);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        pour.onPointerLeave(e);
        onPointerLeave?.(e);
      }}
      {...externalLinkProps(props.href)}
      {...props}
    >
      <span
        data-slot="row-fill"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-ink/5"
      />
      {children}
      {isExternal(props.href) && <NewTabNote />}
    </a>
  );
}
