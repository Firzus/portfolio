import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "../../../lib/utils";

/**
 * The dialog, covering the whole screen above the page. It spreads from the top right corner, where
 * its trigger sits, and drains back into it (styles/global.css).
 */
export function DialogPopup({ className, ...props }: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Popup
        data-slot="dialog-popup"
        className={cn(
          "fixed inset-0 z-30 flex flex-col overflow-y-auto bg-ground text-ink outline-none",
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
}
