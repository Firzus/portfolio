import { describe, expect, it, vi } from "vitest";

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
});
