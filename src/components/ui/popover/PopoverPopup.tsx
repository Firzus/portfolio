import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "../../../lib/utils";

interface PopoverPopupProps extends PopoverPrimitive.Popup.Props {
  side?: PopoverPrimitive.Positioner.Props["side"];
  align?: PopoverPrimitive.Positioner.Props["align"];
}

/** The panel, placed beside its trigger above the page. */
export function PopoverPopup({
  className,
  side = "bottom",
  align = "center",
  ...props
}: PopoverPopupProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner className="z-20" side={side} align={align} sideOffset={6}>
        <PopoverPrimitive.Popup
          data-slot="popover-popup"
          className={cn("rounded-lg border border-line bg-surface outline-none", className)}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}
