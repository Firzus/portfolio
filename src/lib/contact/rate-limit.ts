/**
 * Decision returned by a {@link RateLimiter}. `retryAfterMs` is the time the
 * caller must wait before the current window resets — surfaced to the client so
 * a blocked user gets an honest "try again later" rather than a silent failure.
 */
export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMs: number };

export type RateLimiter = {
  /** Record a hit for `key` and report whether it stays under the limit. */
  check: (key: string) => RateLimitResult;
};

export type RateLimitOptions = {
  /** Max allowed hits per key within a window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Injectable clock for deterministic tests. Defaults to `Date.now`. */
  now?: () => number;
};

type Window = { count: number; resetAt: number };

/**
 * In-memory fixed-window rate limiter. Each key gets a counter that resets once
 * its window elapses; the `(limit + 1)`th hit inside a window is rejected.
 *
 * Chosen over a token bucket for simplicity and zero dependencies: the contact
 * form is low-traffic and only needs a coarse abuse ceiling, not smooth
 * shaping. State lives in a `Map` on the server instance — good enough to blunt
 * a burst from one IP; it is intentionally not a distributed/durable limiter
 * (a serverless cold start or second instance starts with an empty map).
 *
 * Expired entries are swept lazily on access and opportunistically on write, so
 * the map can't grow unbounded under a spread of one-off keys.
 */
export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  const { limit, windowMs } = options;
  const now = options.now ?? Date.now;
  const windows = new Map<string, Window>();

  function sweep(currentTime: number): void {
    for (const [key, window] of windows) {
      if (window.resetAt <= currentTime) windows.delete(key);
    }
  }

  return {
    check(key: string): RateLimitResult {
      const currentTime = now();
      const existing = windows.get(key);

      if (!existing || existing.resetAt <= currentTime) {
        // Opportunistic cleanup keeps memory bounded without a timer.
        if (windows.size > 0) sweep(currentTime);
        windows.set(key, { count: 1, resetAt: currentTime + windowMs });
        return { allowed: true };
      }

      if (existing.count >= limit) {
        return { allowed: false, retryAfterMs: existing.resetAt - currentTime };
      }

      existing.count += 1;
      return { allowed: true };
    },
  };
}
