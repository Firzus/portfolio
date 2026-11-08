import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../../lib/utils";

export const arrowLinkVariants = cva("group inline-flex items-center gap-3 font-semibold", {
  variants: {
    variant: {
      /** An underlined text link. */
      text: "text-ink",
      /** The page's one primary action: a forest control holding the lime square. */
      solid: "bg-field pr-5 text-field-ink transition-colors duration-150 hover:bg-muted",
    },
  },
  defaultVariants: { variant: "text" },
});

type ArrowLinkProps = ComponentProps<"a"> &
  VariantProps<typeof arrowLinkVariants> & { children: ReactNode; direction?: "right" | "left" };

/** A link led by the lime square: the only place the accent appears, besides the closing wordmark. */
export function ArrowLink({ children, variant, direction = "right", className, ...props }: ArrowLinkProps) {
  return (
    <a data-slot="arrow-link" className={cn(arrowLinkVariants({ variant }), className)} {...props}>
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 place-items-center bg-accent text-accent-ink transition-transform duration-200 ease-out group-hover:translate-x-1 group-active:scale-95 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      >
        <svg viewBox="0 0 20 20" className={cn("size-5", direction === "left" && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10h13M11 5l5 5-5 5" />
        </svg>
      </span>
      <span className={cn(variant !== "solid" && "underline decoration-2 underline-offset-4 group-hover:decoration-4")}>{children}</span>
    </a>
  );
}
