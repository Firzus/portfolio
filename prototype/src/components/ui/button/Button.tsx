import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-control font-text font-semibold whitespace-nowrap transition-[transform,background-color,color] duration-150 select-none active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        solid: "bg-accent text-accent-ink hover:bg-ink hover:text-ground",
        inverse: "bg-ground text-ink hover:bg-accent hover:text-accent-ink",
        text: "px-0 underline decoration-2 underline-offset-4 hover:text-accent",
      },
      size: {
        md: "h-12 px-6 text-body",
        sm: "h-10 px-4 text-small",
      },
    },
    compoundVariants: [{ variant: "text", class: "h-auto px-0" }],
    defaultVariants: { variant: "solid", size: "md" },
  },
);

type ButtonProps = ComponentProps<typeof BaseButton> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <BaseButton data-slot="button" className={cn(buttonVariants({ variant, size }), className as string)} {...props} />;
}

type LinkButtonProps = ComponentProps<"a"> & VariantProps<typeof buttonVariants>;

/** A link that shares the button's look, for actions that navigate. */
export function LinkButton({ className, variant, size, ...props }: LinkButtonProps) {
  return <a data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
