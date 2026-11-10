import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "../../../lib/utils";

/** The dialog's name, read by assistive technology when it opens. */
export function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn(className)} {...props} />;
}
