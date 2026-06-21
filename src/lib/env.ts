import { z } from "zod";

/** Resend accepts a bare address or `"Name" <addr@domain.com>`. Validate the addr part. */
function isResendEmailAddress(value: string): boolean {
  const emailPart = value.trim().match(/<([^>]+)>$/)?.[1] ?? value.trim();
  return z.email().safeParse(emailPart).success;
}

const resendEmailAddress = z.string().min(1).refine(isResendEmailAddress, {
  message: "Invalid email address",
});

/**
 * Boundary schema for the server-only environment variables the contact
 * feature needs. Validation happens lazily on first use (see `getContactEnv`)
 * rather than at module load, so local dev and the build can start without
 * Resend credentials configured.
 */
const contactEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  CONTACT_TO_EMAIL: z.email(),
  CONTACT_FROM_EMAIL: resendEmailAddress,
});

export type ContactEnv = z.infer<typeof contactEnvSchema>;

let cached: ContactEnv | undefined;

/**
 * Resolve and validate the contact-related env vars, caching the result.
 *
 * Throws a clear error when a variable is missing or malformed. Call this at
 * the network seam (the contact server function) so a misconfiguration fails
 * loudly at send time instead of silently dropping messages.
 */
export function getContactEnv(): ContactEnv {
  if (cached) return cached;

  const parsed = contactEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid or missing contact environment variables: ${issues}`);
  }

  cached = parsed.data;
  return cached;
}

/**
 * Defaults sized for a personal portfolio: a handful of genuine messages from
 * one visitor in a short span, with anything beyond that treated as abuse.
 * Five submissions per ten minutes per IP leaves ample room for a real person
 * (including retries after a typo) while capping Resend usage from a single
 * source.
 */
const RATE_LIMIT_DEFAULTS = { limit: 5, windowMs: 10 * 60 * 1000 } as const;

export type ContactRateLimitConfig = { limit: number; windowMs: number };

/**
 * Coerce an env var to a positive integer, falling back to `fallback` when
 * unset or malformed. Misconfiguration degrades to the safe default rather than
 * disabling the limiter or crashing the send path.
 */
function positiveIntEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Resolve the contact rate-limit window from env, with production-safe
 * defaults. Overridable via `CONTACT_RATE_LIMIT` (max submissions) and
 * `CONTACT_RATE_LIMIT_WINDOW_MS` (window length in ms).
 */
export function getContactRateLimitConfig(): ContactRateLimitConfig {
  return {
    limit: positiveIntEnv(process.env.CONTACT_RATE_LIMIT, RATE_LIMIT_DEFAULTS.limit),
    windowMs: positiveIntEnv(
      process.env.CONTACT_RATE_LIMIT_WINDOW_MS,
      RATE_LIMIT_DEFAULTS.windowMs,
    ),
  };
}
