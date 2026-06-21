import { Quote } from "lucide-react";

import { testimonials } from "#/lib/testimonials";
import * as m from "#/paraglide/messages";

export function Testimonials() {
  // The whole section is hidden until there is at least one testimonial.
  if (testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          {m.testimonials_eyebrow()}
        </p>
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {m.testimonials_title()}
        </h2>
        <p className="max-w-2xl text-pretty text-muted-foreground">{m.testimonials_subtitle()}</p>
      </div>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <li
            key={testimonial.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
          >
            <Quote className="size-5 text-primary" aria-hidden="true" />
            <blockquote className="text-pretty text-foreground">"{testimonial.quote}"</blockquote>
            <figcaption className="mt-auto flex flex-col">
              {testimonial.url ? (
                <a
                  href={testimonial.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium transition-colors hover:text-primary"
                >
                  {testimonial.author}
                </a>
              ) : (
                <span className="font-medium">{testimonial.author}</span>
              )}
              <span className="text-sm text-muted-foreground">{testimonial.role}</span>
            </figcaption>
          </li>
        ))}
      </ul>
    </section>
  );
}
