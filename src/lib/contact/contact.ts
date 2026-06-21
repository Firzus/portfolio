import { contactSchema, HONEYPOT_FIELD, type ContactInput } from "./schema";

/**
 * Outcome of a contact submission. A discriminated union so callers (and tests)
 * can branch on the exact result without inspecting thrown errors.
 */
export type ContactResult =
  | { status: "ok" }
  | { status: "blocked" }
  | { status: "invalid"; fields: string[] }
  | { status: "error" };

/**
 * Injected side effects. Keeping these as dependencies lets the core logic be
 * unit-tested at its boundary (valid -> send, invalid -> reject, bot -> short
 * circuit) without touching the real BotID or Resend services.
 */
export type ContactDeps = {
  /** Returns `true` when the request looks human, `false` when it's a bot. */
  verifyHuman: () => Promise<boolean>;
  /** Sends the contact email. Rejects on transport failure. */
  sendEmail: (input: ContactInput) => Promise<void>;
};

/**
 * Pure contact-submission core. Validates the payload, runs the anti-bot check,
 * then sends the email — short-circuiting before `sendEmail` when the input is
 * invalid or the caller is classified as a bot.
 */
export async function submitContact(rawInput: unknown, deps: ContactDeps): Promise<ContactResult> {
  // Honeypot: a hidden field no human fills. A non-empty value means a bot —
  // short-circuit as `blocked`. This is a host-independent layer that also
  // covers non-Vercel deploys where BotID isn't provisioned.
  if (
    rawInput &&
    typeof rawInput === "object" &&
    typeof (rawInput as Record<string, unknown>)[HONEYPOT_FIELD] === "string" &&
    ((rawInput as Record<string, unknown>)[HONEYPOT_FIELD] as string).trim() !== ""
  ) {
    return { status: "blocked" };
  }

  const parsed = contactSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => String(issue.path[0] ?? ""));
    return { status: "invalid", fields };
  }

  try {
    const isHuman = await deps.verifyHuman();
    if (!isHuman) return { status: "blocked" };

    await deps.sendEmail(parsed.data);
  } catch {
    return { status: "error" };
  }

  return { status: "ok" };
}
