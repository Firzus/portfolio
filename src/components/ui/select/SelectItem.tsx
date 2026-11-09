import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check } from "iconoir-react";
import { cn } from "../../../lib/utils";

/** One choice of the list, marked when it is the chosen one. */
export function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "flex cursor-default items-center justify-between gap-3 rounded-sm px-2 py-1 outline-none select-none data-highlighted:bg-ink/10",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Check aria-hidden="true" className="size-3.5" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
