import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { resolveLocale } from "#/lib/i18n";

import { listPosts, readPost } from "./posts";
import { listProjects, readProject } from "./projects";

const localeInput = z.object({ locale: z.string().optional() });
const projectInput = z.object({ slug: z.string(), locale: z.string().optional() });
const postInput = z.object({ slug: z.string(), locale: z.string().optional() });

/**
 * Server function: list all projects for a locale (with per-project fallback to
 * en). Safe to call from route loaders; runs the Node-only reader on the server.
 */
export const getProjects = createServerFn({ method: "GET" })
  .validator(localeInput)
  .handler(({ data }) => listProjects(resolveLocale(data.locale)));

/**
 * Server function: read a single project by slug for a locale, falling back to
 * en. Returns `null` when the project does not exist.
 */
export const getProject = createServerFn({ method: "GET" })
  .validator(projectInput)
  .handler(({ data }) => readProject(data.slug, resolveLocale(data.locale)));

/**
 * Server function: list all blog posts for a locale (with per-post fallback to
 * en), newest first. Drafts are excluded.
 */
export const getPosts = createServerFn({ method: "GET" })
  .validator(localeInput)
  .handler(({ data }) => listPosts(resolveLocale(data.locale)));

/**
 * Server function: read a single blog post by slug for a locale, falling back
 * to en. Returns `null` when the post does not exist.
 */
export const getPost = createServerFn({ method: "GET" })
  .validator(postInput)
  .handler(({ data }) => readPost(data.slug, resolveLocale(data.locale)));
