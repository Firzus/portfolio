import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { sendContactMessage } from "#/lib/contact/server";
import { contactSchema, HONEYPOT_FIELD } from "#/lib/contact/schema";
import * as m from "#/paraglide/messages";

type FieldKey = "name" | "email" | "message";
type Status = "idle" | "submitting" | "ok" | "blocked" | "error";

const fieldError: Record<FieldKey, () => string> = {
  name: m.contact_error_name,
  email: m.contact_error_email,
  message: m.contact_error_message,
};

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // BotID requires a fetch/XHR submission (the server function uses fetch),
    // not a native `action`. Prevent the default GET navigation.
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const raw = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
    };
    const honeypot = String(formData.get(HONEYPOT_FIELD) ?? "");

    // Client-side validation mirrors the server schema for instant feedback.
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      const next: Partial<Record<FieldKey, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldKey | undefined;
        if (key && !next[key]) next[key] = fieldError[key]();
      }
      setErrors(next);
      setStatus("idle");
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const result = await sendContactMessage({
        data: { ...parsed.data, [HONEYPOT_FIELD]: honeypot },
      });
      if (result.status === "ok") {
        setStatus("ok");
        form.reset();
      } else if (result.status === "blocked") {
        setStatus("blocked");
      } else if (result.status === "invalid") {
        const next: Partial<Record<FieldKey, string>> = {};
        for (const key of result.fields) {
          if (key in fieldError) next[key as FieldKey] = fieldError[key as FieldKey]();
        }
        setErrors(next);
        setStatus("idle");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div role="status" className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-sm">
        <p className="font-medium text-foreground">{m.contact_success_title()}</p>
        <p className="mt-1 text-muted-foreground">{m.contact_success_body()}</p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Honeypot: hidden from humans, off the tab order; bots that fill it are
          blocked server-side. Not `display:none` so some bots still see it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-name">{m.contact_field_name()}</Label>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          placeholder={m.contact_field_name_placeholder()}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          disabled={submitting}
        />
        {errors.name && (
          <p id="contact-name-error" className="text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-email">{m.contact_field_email()}</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={m.contact_field_email_placeholder()}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          disabled={submitting}
        />
        {errors.email && (
          <p id="contact-email-error" className="text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-message">{m.contact_field_message()}</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          placeholder={m.contact_field_message_placeholder()}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          disabled={submitting}
        />
        {errors.message && (
          <p id="contact-message-error" className="text-sm text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      {status === "blocked" && (
        <p role="alert" className="text-sm text-destructive">
          {m.contact_blocked()}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {m.contact_error()}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="w-fit">
        {submitting ? m.contact_submitting() : m.contact_submit()}
      </Button>
    </form>
  );
}
