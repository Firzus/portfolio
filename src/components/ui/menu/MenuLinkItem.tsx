import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "../../../lib/utils";

/**
 * An item of the menu that navigates. It closes the menu on click, which Base UI does not by
 * default: a link to a section of the same page would otherwise leave the menu open over it.
 */
export function MenuLinkItem({
  className,
  closeOnClick = true,
  ...props
}: MenuPrimitive.LinkItem.Props) {
  return (
    <MenuPrimitive.LinkItem
      data-slot="menu-link-item"
      closeOnClick={closeOnClick}
      className={cn(
        "flex h-11 items-center rounded-lg px-3 text-small font-medium outline-none select-none data-highlighted:bg-ink/10 aria-[current=page]:text-accent",
        className,
      )}
      {...props}
    />
  );
}
