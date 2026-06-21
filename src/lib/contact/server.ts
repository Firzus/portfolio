import { createServerFn } from "@tanstack/react-start";
import { checkBotId } from "botid/server";
import { Resend } from "resend";
import { z } from "zod";

import { getContactEnv } from "#/lib/env";

import { submitContact, type ContactResult } from "./contact";
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
 * Server function: validate the contact payload (Zod), run the BotID check, and
 * send the email via Resend. Returns a discriminated result the client renders
 * as success / blocked / validation / error states.
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
    });
  });
