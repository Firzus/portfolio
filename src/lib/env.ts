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
