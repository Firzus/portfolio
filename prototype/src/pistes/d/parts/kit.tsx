import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { usePour, useRipple } from "../motion/fluid";

/** Horizontal padding shared by every band of the framed column. */
export const gutter = "px-5 md:px-8 lg:px-11";

/** A full-width band of the column, closed by a hairline. */
export function Band({ className, children, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("border-b border-ink/8", className)} {...props}>
      <div className={cn(gutter, "py-16 md:py-24")}>{children}</div>
    </section>
  );
}

/** Quiet line above a title. */
export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("text-small font-medium text-ink/55", className)}>{children}</p>;
}

/** A type or category in front of a row; the accent tone marks the one that matters. */
export function Tag({ tone = "ink", children }: { tone?: "ink" | "accent"; children: ReactNode }) {
  return <span className={cn("text-[0.8125rem] font-medium", tone === "accent" ? "text-accent" : "text-ink/55")}>{children}</span>;
}

/** Filled chip for a fact. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-ink/6 px-2 py-1 text-[0.8125rem] font-medium text-ink/70">
      {children}
    </span>
  );
}

/** The link at the foot of a card, pushed to the bottom so the cards of a row align. */
export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="group mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-ink hover:text-accent">
      {children}
      <Arrow />
    </a>
  );
}

export function Arrow({ external, className }: { external?: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("inline-block transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none", className)}>
      {external ? "↗" : "→"}
    </span>
  );
}

/** Figures under a hero: a value and its label. Numbers are set in mono; worded facts (`compact`) in the text face. */
export function Stats({ items, compact, className }: { items: { value: string; label: string }[]; compact?: boolean; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-3 gap-4 md:gap-8", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex flex-col-reverse justify-end gap-2">
          <dt className="text-[0.8125rem] text-ink/55">{item.label}</dt>
          <dd className={cn("font-medium tracking-tight", compact ? "text-body leading-snug" : "text-lg tabular-nums md:text-[1.625rem] md:leading-none")}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A placeholder picture, framed like the inspiration's thumbnails. */
export function Thumb({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const ripple = useRipple<HTMLImageElement>();
  return (
    <img
      ref={ripple}
      src={src}
      alt={alt}
      width={1586}
      height={992}
      loading={eager ? undefined : "lazy"}
      className={cn("aspect-[16/10] w-full rounded-lg border border-ink/8 bg-surface object-cover", className)}
    />
  );
}

/** A row of a link list; a faint fill pours in from where the pointer enters. */
export function PourRow({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const pour = usePour();
  return (
    <a href={href} {...pour} className={cn("group relative isolate flex items-center gap-4 border-b border-ink/8 py-3.5 text-[0.9375rem] font-medium hover:text-accent", className)}>
      <span data-pour aria-hidden className="pointer-events-none absolute -inset-x-3 inset-y-0 -z-10 rounded-md bg-ink/5 [clip-path:circle(0%)]" />
      {children}
    </a>
  );
}
