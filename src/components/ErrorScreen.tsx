import type * as React from "react";
import { gutter } from "../lib/layout";
import { cn } from "../lib/utils";
import { ShaderLayer } from "./motion/shaders/ShaderLayer";

interface ErrorScreenProps {
  /** Which screen this is, for styles and tests (`not-found`, `offline`, `updated`, `error`). */
  kind: string;
  /** What fills the drop: a status code, or an icon when there is none. */
  code: React.ReactNode;
  title: string;
  text: string;
  /** The ways out, the first one being the main action. */
  actions: React.ReactNode;
}

/**
 * The page shown instead of the one asked for: what happened in a sentence, and the way out. The
 * code sits in a large drop of the site's liquid, so even a wrong turn looks like the site.
 */
export function ErrorScreen({ kind, code, title, text, actions }: ErrorScreenProps) {
  return (
    <main
      data-error-screen={kind}
      className={cn(gutter, "grid items-center gap-12 py-20 md:py-28 lg:grid-cols-5 lg:gap-16")}
    >
      <div className="lg:col-span-3">
        <h1 className="font-display text-display font-heading">{title}</h1>
        <p className="mt-6 max-w-md text-lead text-muted">{text}</p>
        <div className="mt-9 flex flex-wrap gap-2.5">{actions}</div>
      </div>
      <div className="flex justify-center lg:col-span-2 lg:justify-end">
        <div
          aria-hidden="true"
          data-drop
          className="relative isolate grid size-56 place-items-center overflow-hidden md:size-72"
        >
          <ShaderLayer scene="hero" className="-z-10" />
          <span
            data-error-code
            className="font-display text-display font-heading text-ink tabular-nums"
          >
            {code}
          </span>
        </div>
      </div>
    </main>
  );
}
