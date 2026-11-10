import { m } from "../../../paraglide/messages.js";

/**
 * Hidden text closing the name of a link to another site, so screen reader users know it opens a
 * new tab before they follow it; sighted readers have the arrow pointing out of the page.
 */
export function NewTabNote() {
  return (
    <span data-slot="new-tab-note" className="sr-only">
      {` ${m.link_new_tab()}`}
    </span>
  );
}
