import { describe, expect, it } from "vitest";

import { isVerifiedHuman } from "#/lib/contact/bot-check";

describe("isVerifiedHuman", () => {
  it("accepts an explicit human verdict", () => {
    expect(isVerifiedHuman({ isBot: false })).toBe(true);
  });

  it("rejects an explicit bot verdict", () => {
    expect(isVerifiedHuman({ isBot: true })).toBe(false);
  });

  it("rejects an ambiguous verdict (missing isBot)", () => {
    expect(isVerifiedHuman({})).toBe(false);
  });

  it("rejects a malformed verdict (undefined / null)", () => {
    expect(isVerifiedHuman(undefined)).toBe(false);
    expect(isVerifiedHuman(null)).toBe(false);
  });

  it("does not coerce truthy non-boolean values to human", () => {
    // A non-boolean `isBot` (e.g. a stringified value) must not pass as human.
    expect(isVerifiedHuman({ isBot: "false" })).toBe(false);
    expect(isVerifiedHuman({ isBot: 0 })).toBe(false);
  });
});
