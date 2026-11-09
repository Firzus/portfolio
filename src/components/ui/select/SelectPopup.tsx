import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cn } from "../../../lib/utils";

/** The list of choices, placed under its trigger above the page. */
export function SelectPopup({ className, children, ...props }: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className="z-20 outline-none"
        sideOffset={4}
        alignItemWithTrigger={false}
      >
        <SelectPrimitive.Popup
          data-slot="select-popup"
          className={cn("rounded-md border border-line bg-surface p-1 outline-none", className)}
          {...props}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}
