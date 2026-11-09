import { Select as SelectPrimitive } from "@base-ui/react/select";
import { NavArrowDown } from "iconoir-react";
import { cn } from "../../../lib/utils";

/** The button that shows the chosen value and opens the list. */
export function SelectTrigger({ className, ...props }: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md border border-line bg-surface px-2 text-left select-none",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Value className="truncate" />
      <SelectPrimitive.Icon className="shrink-0">
        <NavArrowDown aria-hidden="true" className="size-3.5" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
