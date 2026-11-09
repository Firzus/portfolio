import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "../../../lib/utils";

/** An item of the menu that navigates. */
export function MenuLinkItem({ className, ...props }: MenuPrimitive.LinkItem.Props) {
  return (
    <MenuPrimitive.LinkItem
      data-slot="menu-link-item"
      className={cn(
        "flex h-11 items-center rounded-lg px-3 text-small font-medium outline-none select-none data-highlighted:bg-ink/10 aria-[current=page]:text-accent",
        className,
      )}
      {...props}
    />
  );
}
