import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { checkBotId } from "botid/server";
import { Resend } from "resend";
import { z } from "zod";

import { getContactEnv, getContactRateLimitConfig } from "#/lib/env";

import { submitContact, type ContactResult } from "./contact";
import { createRateLimiter, type RateLimitResult } from "./rate-limit";
import { HONEYPOT_FIELD, type ContactInput } from "./schema";

/**
 * Loose boundary schema for the server function: accepts the form fields plus
 * the optional honeypot, without stripping it. `submitContact` then runs the
 * strict `contactSchema` validation and the honeypot check on this payload.
 */
const contactRequestSchema = z.object({
  name: z.string(),
  email: z.string(),
  message: z.string(),
  [HONEYPOT_FIELD]: z.string().optional(),
});

/**
 * Build the Resend-backed email sender from validated env. Resend reports
 * failures via a returned `error` rather than throwing, so normalize that into
 * a throw — `submitContact` maps a throw to an `error` result.
 */
function sendContactEmail(input: ContactInput): Promise<void> {
  const env = getContactEnv();
  const resend = new Resend(env.RESEND_API_KEY);

  return resend.emails
    .send({
      from: env.CONTACT_FROM_EMAIL,
      to: env.CONTACT_TO_EMAIL,
      replyTo: input.email,
      subject: `Portfolio contact — ${input.name}`,
      text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
    })
    .then(({ error }) => {
      if (error) throw new Error(error.message);
    });
}

/**
 * Process-wide limiter shared across requests. Lazily built so the window can
 * be read from env on first use and so importing this module stays side-effect
 * free. One instance per server process; see `createRateLimiter` for the
 * (intentional) non-distributed semantics.
 */
let limiter: ReturnType<typeof createRateLimiter> | undefined;

function getLimiter(): ReturnType<typeof createRateLimiter> {
  if (!limiter) limiter = createRateLimiter(getContactRateLimitConfig());
  return limiter;
}

/**
 * Rate-limit key for the caller. Prefer the proxy-forwarded client IP (Vercel
 * sets `x-forwarded-for`); when it can't be determined, fall back to a single
 * shared bucket so the limiter fails closed (still caps total throughput)
 * rather than open (one bucket per request = no limit at all).
 */
function rateLimitForRequest(): RateLimitResult {
  const ip = getRequestIP({ xForwardedFor: true });
  return getLimiter().check(ip ?? "unknown");
}

/**
 * Server function: validate the contact payload (Zod), enforce the per-IP rate
 * limit, run the BotID check, and send the email via Resend. Returns a
 * discriminated result the client renders as success / blocked / rate-limited /
 * validation / error states.
 */
export const sendContactMessage = createServerFn({ method: "POST" })
  .validator(contactRequestSchema)
  .handler(async ({ data }): Promise<ContactResult> => {
    return submitContact(data, {
      verifyHuman: async () => {
        const { isBot } = await checkBotId();
        return !isBot;
      },
      sendEmail: sendContactEmail,
      checkRateLimit: rateLimitForRequest,
    });
  });
