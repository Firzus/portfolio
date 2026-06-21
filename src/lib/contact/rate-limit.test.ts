import { describe, expect, it } from "vitest";

import { createRateLimiter } from "#/lib/contact/rate-limit";

describe("createRateLimiter", () => {
  it("allows hits up to the limit then blocks within the window", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => 0 });

    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(true);

    const blocked = limiter.check("ip");
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) expect(blocked.retryAfterMs).toBe(60_000);
  });

  it("tracks keys independently", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => 0 });

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    expect(limiter.check("b").allowed).toBe(true);
  });

  it("resets once the window elapses", () => {
    let clock = 0;
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => clock });

    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(false);

    clock = 1_000;
    expect(limiter.check("ip").allowed).toBe(true);
  });

  it("reports a shrinking retry-after as the window advances", () => {
    let clock = 0;
    const limiter = createRateLimiter({ limit: 1, windowMs: 10_000, now: () => clock });

    limiter.check("ip");
    clock = 4_000;
    const blocked = limiter.check("ip");

    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) expect(blocked.retryAfterMs).toBe(6_000);
  });
});
