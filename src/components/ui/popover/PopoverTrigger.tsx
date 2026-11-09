import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "../../../lib/utils";

export function PopoverTrigger({ className, ...props }: PopoverPrimitive.Trigger.Props) {
  return (
    <PopoverPrimitive.Trigger data-slot="popover-trigger" className={cn(className)} {...props} />
  );
}
