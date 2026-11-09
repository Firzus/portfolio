import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "../../../lib/utils";

interface MenuPopupProps extends MenuPrimitive.Popup.Props {
  align?: MenuPrimitive.Positioner.Props["align"];
}

/** The list of items, placed under its trigger above the page. */
export function MenuPopup({ className, align = "end", ...props }: MenuPopupProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className="z-20 outline-none" align={align} sideOffset={8}>
        <MenuPrimitive.Popup
          data-slot="menu-popup"
          className={cn(
            "min-w-56 origin-top-right rounded-xl border border-line bg-surface p-1.5 text-ink outline-none transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none",
            className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}
