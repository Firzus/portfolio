import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "../../../lib/utils";

/** The button that opens the menu, marked while its menu is open. */
export function MenuTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="menu-trigger"
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg border border-ink/12 px-3 text-caption font-medium data-popup-open:bg-ink/10",
        className,
      )}
      {...props}
    />
  );
}
