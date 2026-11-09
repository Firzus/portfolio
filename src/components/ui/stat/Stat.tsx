import type * as React from "react";
import { cn } from "../../../lib/utils";

interface StatProps extends Omit<React.ComponentProps<"div">, "children"> {
  value: React.ReactNode;
  label: React.ReactNode;
}

/** A figure and what it counts, as one entry of a `<dl>`. The figure is shown above its label. */
export function Stat({ value, label, className, ...props }: StatProps) {
  return (
    <div
      data-slot="stat"
      className={cn("flex flex-col-reverse justify-end gap-2", className)}
      {...props}
    >
      <dt className="text-caption text-muted">{label}</dt>
      <dd className="text-lead font-medium tracking-tight tabular-nums md:text-title">{value}</dd>
    </div>
  );
}
