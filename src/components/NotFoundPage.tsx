import { m } from "../paraglide/messages.js";
import { localizeHref } from "../paraglide/runtime.js";
import { ErrorScreen } from "./ErrorScreen";
import { LinkButton } from "./ui/link-button";

export function NotFoundPage() {
  return (
    <ErrorScreen
      kind="not-found"
      code="404"
      title={m.not_found_title()}
      text={m.not_found_text()}
      actions={
        <>
          <LinkButton href={localizeHref("/")}>{m.not_found_home()}</LinkButton>
          <LinkButton href={`${localizeHref("/")}#projects`} variant="outline">
            {m.home_hero_projects_cta()}
          </LinkButton>
        </>
      }
    />
  );
}
