import { Download } from "lucide-react";

import { Button } from "#/components/ui/button";
import { siteConfig } from "#/lib/site-config";
import * as m from "#/paraglide/messages";

export function About() {
  return (
    <section id="about" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            {m.about_eyebrow()}
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {m.about_title()}
          </h2>
        </div>

        <div className="flex flex-col items-start gap-6">
          <p className="text-pretty text-lg text-foreground">{m.about_lead()}</p>
          <p className="text-pretty text-muted-foreground">{m.about_body_1()}</p>
          <p className="text-pretty text-muted-foreground">{m.about_body_2()}</p>

          <Button
            size="lg"
            nativeButton={false}
            render={
              <a href={siteConfig.cvPath} download target="_blank" rel="noreferrer noopener" />
            }
          >
            <Download className="size-4" />
            {m.about_cv_download()}
          </Button>
        </div>
      </div>
    </section>
  );
}
