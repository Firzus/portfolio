/**
 * Shape we rely on from BotID's `checkBotId()`. The real result carries more
 * fields, but only `isBot` drives the human/bot decision here. Typed loosely so
 * an ambiguous verdict (missing/non-boolean `isBot`) is representable and can be
 * rejected rather than coerced.
 */
export type BotVerdict = { isBot?: unknown };

/**
 * Interpret a BotID verdict, fail-closed. Only an explicit `isBot === false`
 * counts as human; anything else (a `true` bot verdict, a missing/ambiguous
 * value, a malformed result) is treated as not-human so the caller blocks
 * rather than sends. A thrown verification (network, missing OIDC) never reaches
 * here — that surfaces as an error upstream.
 */
export function isVerifiedHuman(verdict: BotVerdict | null | undefined): boolean {
  return verdict?.isBot === false;
}
