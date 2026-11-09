import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { cn } from "../../../lib/utils";

/** Buttons of which one stays pressed, moved between with the arrow keys. */
export function ToggleGroup({ className, ...props }: ToggleGroupPrimitive.Props) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn("inline-flex rounded-md bg-surface p-0.5", className)}
      {...props}
    />
  );
}
