import { describe, expect, it, vi } from "vitest";

import { isVerifiedHuman } from "#/lib/contact/bot-check";
import { submitContact, type ContactDeps } from "#/lib/contact/contact";
import type { ContactInput } from "#/lib/contact/schema";

const VALID_INPUT: ContactInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello, I would like to discuss a role.",
};

/**
 * Build deps with spy doubles. `verifyHuman` defaults to human; `sendEmail`
 * resolves. Override per test to exercise the bot / failure branches.
 */
function makeDeps(overrides: Partial<ContactDeps> = {}): {
  deps: ContactDeps;
  verifyHuman: ReturnType<typeof vi.fn>;
  sendEmail: ReturnType<typeof vi.fn>;
} {
  const verifyHuman = vi.fn(async () => true);
  const sendEmail = vi.fn(async () => {});
  const deps: ContactDeps = { verifyHuman, sendEmail, ...overrides };
  return { deps, verifyHuman, sendEmail };
}

describe("submitContact", () => {
  it("sends the email on a valid payload", async () => {
    const { deps, sendEmail } = makeDeps();

    const result = await submitContact(VALID_INPUT, deps);

    expect(result).toEqual({ status: "ok" });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(VALID_INPUT);
  });

  it("rejects an invalid payload without sending", async () => {
    const { deps, sendEmail, verifyHuman } = makeDeps();

    const result = await submitContact({ name: "", email: "not-an-email", message: "short" }, deps);

    expect(result.status).toBe("invalid");
    if (result.status === "invalid") {
      expect(result.fields).toContain("name");
      expect(result.fields).toContain("email");
      expect(result.fields).toContain("message");
    }
    expect(verifyHuman).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("short-circuits when the caller is classified as a bot", async () => {
    const { deps, sendEmail } = makeDeps({ verifyHuman: vi.fn(async () => false) });

    const result = await submitContact(VALID_INPUT, deps);

    expect(result).toEqual({ status: "blocked" });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns an error result when sending fails", async () => {
    const { deps } = makeDeps({
      sendEmail: vi.fn(async () => {
        throw new Error("transport down");
      }),
    });

    const result = await submitContact(VALID_INPUT, deps);

    expect(result).toEqual({ status: "error" });
  });

  it("returns an error result when the bot check throws", async () => {
    const { deps, sendEmail } = makeDeps({
      verifyHuman: vi.fn(async () => {
        throw new Error("VERCEL_OIDC_TOKEN is not set");
      }),
    });

    const result = await submitContact(VALID_INPUT, deps);

    expect(result).toEqual({ status: "error" });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  // Fail-closed wiring: an ambiguous BotID verdict (no `isBot`) must resolve to
  // not-human through `isVerifiedHuman`, so the submission is blocked and never
  // reaches Resend — same path the server function takes.
  it("blocks an ambiguous bot verdict without sending (fail-closed)", async () => {
    const { deps, sendEmail } = makeDeps({
      verifyHuman: vi.fn(async () => isVerifiedHuman(await Promise.resolve({}))),
    });

    const result = await submitContact(VALID_INPUT, deps);

    expect(result).toEqual({ status: "blocked" });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends only on an explicit human verdict (isBot === false)", async () => {
    const { deps, sendEmail } = makeDeps({
      verifyHuman: vi.fn(async () => isVerifiedHuman(await Promise.resolve({ isBot: false }))),
    });

    const result = await submitContact(VALID_INPUT, deps);

    expect(result).toEqual({ status: "ok" });
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("blocks a submission that fills the honeypot field", async () => {
    const { deps, sendEmail, verifyHuman } = makeDeps();

    const result = await submitContact({ ...VALID_INPUT, company: "Acme Corp" }, deps);

    expect(result).toEqual({ status: "blocked" });
    expect(verifyHuman).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("ignores an empty honeypot field", async () => {
    const { deps, sendEmail } = makeDeps();

    const result = await submitContact({ ...VALID_INPUT, company: "  " }, deps);

    expect(result).toEqual({ status: "ok" });
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("rejects a name containing line breaks (header hardening)", async () => {
    const { deps, sendEmail } = makeDeps();

    const result = await submitContact(
      {
        name: "Ada\r\nBcc: victim@example.com",
        email: "ada@example.com",
        message: "A valid message.",
      },
      deps,
    );

    expect(result.status).toBe("invalid");
    if (result.status === "invalid") expect(result.fields).toContain("name");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("trims and normalizes the payload before sending", async () => {
    const { deps, sendEmail } = makeDeps();

    await submitContact(
      { name: "  Ada  ", email: "ada@example.com", message: "  A long enough message.  " },
      deps,
    );

    expect(sendEmail).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
      message: "A long enough message.",
    });
  });

  it("blocks a rate-limited submission without verifying or sending", async () => {
    const { deps, sendEmail, verifyHuman } = makeDeps({
      checkRateLimit: vi.fn(() => ({ allowed: false, retryAfterMs: 5_000 })),
    });

    const result = await submitContact(VALID_INPUT, deps);

    expect(result).toEqual({ status: "rate_limited", retryAfterMs: 5_000 });
    expect(verifyHuman).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does not consume rate-limit quota for an invalid payload", async () => {
    const checkRateLimit = vi.fn(() => ({ allowed: true }) as const);
    const { deps } = makeDeps({ checkRateLimit });

    const result = await submitContact({ name: "", email: "bad", message: "short" }, deps);

    expect(result.status).toBe("invalid");
    expect(checkRateLimit).not.toHaveBeenCalled();
  });

  it("sends when the caller is under the rate limit", async () => {
    const checkRateLimit = vi.fn(() => ({ allowed: true }) as const);
    const { deps, sendEmail } = makeDeps({ checkRateLimit });

    const result = await submitContact(VALID_INPUT, deps);

    expect(result).toEqual({ status: "ok" });
    expect(checkRateLimit).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
