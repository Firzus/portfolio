import type { RateLimitResult } from "./rate-limit";
import { contactSchema, HONEYPOT_FIELD, type ContactInput } from "./schema";

/**
 * Outcome of a contact submission. A discriminated union so callers (and tests)
 * can branch on the exact result without inspecting thrown errors.
 *
 * `rate_limited` carries `retryAfterMs` so the UI can tell the user roughly how
 * long to wait instead of failing opaquely.
 */
export type ContactResult =
  | { status: "ok" }
  | { status: "blocked" }
  | { status: "rate_limited"; retryAfterMs: number }
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
  /**
   * Records the submission against the caller's rate-limit window and reports
   * whether it's allowed. Optional: when omitted (e.g. unit tests, or a deploy
   * without a configured limiter) the check is skipped, like the honeypot layer.
   */
  checkRateLimit?: () => RateLimitResult;
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

  // Rate-limit only well-formed submissions: invalid/honeypot payloads are
  // rejected cheaply above and never reach Resend, so they shouldn't consume a
  // legitimate caller's quota. This gates the expensive BotID + Resend calls.
  if (deps.checkRateLimit) {
    const decision = deps.checkRateLimit();
    if (!decision.allowed) {
      return { status: "rate_limited", retryAfterMs: decision.retryAfterMs };
    }
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
