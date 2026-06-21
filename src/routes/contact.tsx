import { createFileRoute } from "@tanstack/react-router";

import { ContactForm } from "#/components/contact-form";
import { SiteHeader } from "#/components/site-header";
import { buildPageHead } from "#/lib/seo/meta";
import { contactPageJsonLd } from "#/lib/structured-data";
import { getLocale } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

export const Route = createFileRoute("/contact")({
  head: () =>
    buildPageHead({
      title: m.contact_meta_title(),
      description: m.contact_meta_description(),
      pathname: "/contact",
      extraMeta: [
        {
          "script:ld+json": contactPageJsonLd(
            getLocale(),
            m.contact_meta_title(),
            m.contact_meta_description(),
          ),
        },
      ],
    }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {m.contact_title()}
            </h1>
            <p className="max-w-xl text-pretty text-muted-foreground">{m.contact_subtitle()}</p>
          </div>

          <div className="mt-10">
            <ContactForm />
          </div>
        </section>
      </main>
    </div>
  );
}
