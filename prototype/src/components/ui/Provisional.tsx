import type { ComponentProps } from "react";
import type { Provisional as ProvisionalText } from "../../content";
import { cn } from "../../lib/utils";

/** Renders a text and, when it is not confirmed yet, a visible "provisoire" mark after it. */
export function Provisional({ value, className, ...props }: { value: ProvisionalText } & ComponentProps<"span">) {
  return (
    <span data-slot="provisional" className={className} {...props}>
      {value.text}
      {value.provisional && (
        <span className={cn("ml-2 inline-block bg-surface px-1.5 text-small font-normal text-muted not-italic")}>
          provisoire
        </span>
      )}
    </span>
  );
}
