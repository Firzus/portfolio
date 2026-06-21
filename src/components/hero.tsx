import { ArrowUpRight } from "lucide-react";

import { Button } from "#/components/ui/button";
import { HeroShader } from "#/components/hero-shader";
import { Reveal } from "#/components/motion/reveal";
import { SocialLinks } from "#/components/social-links";
import { localizeHref } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal stagger className="flex flex-col items-start gap-6 text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
            <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
            {m.hero_availability()}
          </span>

          <p className="text-sm font-medium uppercase tracking-widest text-accent-gold">
            {m.hero_role()}
          </p>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {m.hero_title()}
          </h1>

          <p className="max-w-xl text-pretty text-lg text-muted-foreground">{m.hero_subtitle()}</p>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" nativeButton={false} render={<a href={localizeHref("/contact")} />}>
              {m.cta_contact()}
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<a href={localizeHref("/projects")} />}
            >
              {m.cta_projects()}
              <ArrowUpRight className="size-4" />
            </Button>
          </div>

          <SocialLinks className="mt-2" />
        </Reveal>

        {/* Signature shader: GPU gold marbling with a static, SSR-safe fallback. */}
        <div
          aria-hidden="true"
          className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-card lg:aspect-[4/5]"
        >
          <HeroShader />
          <div className="pointer-events-none absolute inset-0 flex items-end justify-start p-4">
            <span className="rounded-full border border-border bg-background/70 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur">
              {m.hero_visual_label()}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
