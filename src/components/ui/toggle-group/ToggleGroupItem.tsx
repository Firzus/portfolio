import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cn } from "../../../lib/utils";

export function ToggleGroupItem({ className, ...props }: TogglePrimitive.Props) {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn("rounded-sm px-2 py-0.5 select-none data-pressed:bg-ink/10", className)}
      {...props}
    />
  );
}
