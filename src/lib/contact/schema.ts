import { z } from "zod";

/**
 * Hidden honeypot field name. Rendered off-screen in the form; bots that fill
 * every input trip it. Kept here so the form and the core check stay in sync.
 */
export const HONEYPOT_FIELD = "company";

/**
 * Boundary schema for the contact form payload. Shared by the client form and
 * the server function so client- and server-side validation cannot drift.
 *
 * Bounds keep payloads sane (and double as a cheap abuse guard): a message must
 * be non-trivial but cannot be unbounded. `name` rejects newlines/control chars
 * so it can't tamper with the email subject line (header hardening).
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[^\r\n]+$/, "Must not contain line breaks"),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
