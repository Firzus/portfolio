import type { ErrorComponentProps } from "@tanstack/react-router";
import { CloudXmark, Refresh, WarningTriangle } from "iconoir-react";
import { useEffect, useState } from "react";
import { m } from "../paraglide/messages.js";
import { localizeHref } from "../paraglide/runtime.js";
import { ErrorScreen } from "./ErrorScreen";
import { errorKind, type ErrorKind } from "./errorKind";
import { buttonVariants, LinkButton } from "./ui/link-button";

const reload = () => window.location.reload();

/**
 * The page shown when a page fails to load or to render. It tells apart a lost connection, a tab
 * left open across a deploy, and any other failure, since each has its own way out. The server
 * cannot know the connection, so it renders the plain error and the browser refines it.
 */
export function ErrorPage({ error }: ErrorComponentProps) {
  const [kind, setKind] = useState<ErrorKind>("error");
  useEffect(() => {
    const update = () => setKind(errorKind(error, navigator.onLine));
    update();
    // Back online, the page that could not load gets another try on its own.
    const retry = () => reload();
    window.addEventListener("online", retry);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", retry);
      window.removeEventListener("offline", update);
    };
  }, [error]);

  const texts = {
    offline: { title: m.error_offline_title(), text: m.error_offline_text() },
    updated: { title: m.error_updated_title(), text: m.error_updated_text() },
    error: { title: m.error_title(), text: m.error_text() },
  }[kind];

  return (
    <ErrorScreen
      kind={kind}
      code={
        kind === "offline" ? (
          <CloudXmark className="size-20 md:size-24" />
        ) : kind === "updated" ? (
          <Refresh className="size-20 md:size-24" />
        ) : (
          <WarningTriangle className="size-20 md:size-24" />
        )
      }
      title={texts.title}
      text={texts.text}
      actions={
        <>
          <button type="button" onClick={reload} className={buttonVariants()}>
            {kind === "offline" ? m.error_retry() : m.error_reload()}
          </button>
          <LinkButton href={localizeHref("/")} variant="outline">
            {m.not_found_home()}
          </LinkButton>
        </>
      }
    />
  );
}
