/**
 * Static testimonials data. Content is author-provided and not localized:
 * a quote is reproduced verbatim in the language it was given.
 *
 * Empty by default — the Testimonials section is hidden entirely while this
 * list has no entries (see `Testimonials`). Populate it to activate the section.
 */
export type Testimonial = {
  /** Stable key for React lists. */
  id: string;
  /** The quote, reproduced verbatim. */
  quote: string;
  /** Person who gave the testimonial. */
  author: string;
  /** Role / company shown under the author's name. */
  role: string;
  /** Optional link to the author (LinkedIn, site…). */
  url?: string;
};

export const testimonials: readonly Testimonial[] = [] as const;
