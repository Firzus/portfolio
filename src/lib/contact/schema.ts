import { z } from "zod";

/**
 * Boundary schema for the contact form payload. Shared by the client form and
 * the server function so client- and server-side validation cannot drift.
 *
 * Bounds keep payloads sane (and double as a cheap abuse guard): a message must
 * be non-trivial but cannot be unbounded.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
