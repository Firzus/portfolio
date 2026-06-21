import type { ProjectCategory } from "#/lib/content/schema";
import * as m from "#/paraglide/messages";

/**
 * Resolve a project category to its localized label via Paraglide messages.
 * Keeps the category enum (content concern) decoupled from display copy.
 */
export function categoryLabel(category: ProjectCategory): string {
  switch (category) {
    case "web":
      return m.category_web();
    case "desktop":
      return m.category_desktop();
    case "games":
      return m.category_games();
    case "ai":
      return m.category_ai();
  }
}
