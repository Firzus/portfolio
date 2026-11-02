import { defineMiddleware } from "astro:middleware";
import { assertIsLocale, baseLocale, setLocale } from "./paraglide/runtime.js";

// Static pages have no request for Paraglide to read, so the locale Astro
// derives from the route is set before each page renders. This relies on
// pages being rendered one at a time (Astro's default build concurrency).
export const onRequest = defineMiddleware(async (context, next) => {
  await setLocale(assertIsLocale(context.currentLocale ?? baseLocale));
  return next();
});
