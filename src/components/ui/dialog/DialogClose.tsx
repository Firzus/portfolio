import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "../../../lib/utils";

/** The button that closes the dialog, styled like its trigger. */
export function DialogClose({ className, ...props }: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      className={cn(
        // A filled shape 44px tall: a finger reaches it, and no outline is needed to see it.
        "group/menu-button inline-flex h-11 items-center gap-2.5 rounded-full bg-pill pr-4 pl-5 text-small font-medium transition active:scale-95 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}
