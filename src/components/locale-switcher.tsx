import { Menu } from "@base-ui/react/menu";
import { Check, Languages } from "lucide-react";

import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { getLocale, type Locale, localizeHref, locales } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
};

export function LocaleSwitcher() {
  const currentLocale = getLocale();
  // Locale switching changes the URL prefix, so we link to the localized
  // version of the current path and let a full navigation re-resolve SSR.
  const currentPath =
    typeof window === "undefined" ? "/" : window.location.pathname + window.location.search;

  return (
    <Menu.Root>
      <Menu.Trigger
        render={<Button variant="outline" size="icon" aria-label={m.locale_switcher_label()} />}
      >
        <Languages className="size-4" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end">
          <Menu.Popup className="min-w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none">
            {locales.map((locale) => (
              <Menu.Item
                key={locale}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
                  "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                )}
                render={<a href={localizeHref(currentPath, { locale })} hrefLang={locale} />}
              >
                {localeLabels[locale]}
                {locale === currentLocale ? <Check className="size-4" /> : null}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
