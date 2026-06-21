import { Menu } from "@base-ui/react/menu";
import { useLocation } from "@tanstack/react-router";
import { Menu as MenuIcon } from "lucide-react";

import { Button } from "#/components/ui/button";
import { LocaleSwitcher } from "#/components/locale-switcher";
import { SocialLinks } from "#/components/social-links";
import { ThemeToggle } from "#/components/theme-toggle";
import { cn } from "#/lib/utils";
import { navItems } from "#/lib/site-config";
import { localizeHref } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

function isActivePath(current: string, href: string) {
  // Anchor links (e.g. `/#projects`) are active when on their base page.
  const [path] = href.split("#");
  const base = path === "" ? "/" : path;
  if (base === "/") return current === "/";
  return current === base || current.startsWith(`${base}/`);
}

/** Localize an href while preserving a trailing `#hash` anchor. */
function localizeNavHref(href: string): string {
  const [path, hash] = href.split("#");
  const localized = localizeHref(path === "" ? "/" : path);
  return hash ? `${localized}#${hash}` : localized;
}

export function SiteHeader() {
  // `useLocation` exposes the canonical (de-localized) pathname because the
  // router rewrite strips the locale prefix on input.
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href={localizeHref("/")}
          className="text-sm font-semibold tracking-tight transition-colors hover:text-accent-gold"
        >
          {m.nav_brand()}
        </a>

        <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <a
                key={item.href}
                href={localizeNavHref(item.href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m[item.labelKey]()}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <SocialLinks className="hidden sm:flex" />
          <LocaleSwitcher />
          <ThemeToggle />

          <Menu.Root>
            <Menu.Trigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label={m.nav_menu_label()}
                />
              }
            >
              <MenuIcon className="size-4" />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner sideOffset={8} align="end" className="z-50">
                <Menu.Popup className="min-w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none">
                  {navItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <Menu.Item
                        key={item.href}
                        className={cn(
                          "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none",
                          "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                          active && "font-medium text-foreground",
                        )}
                        render={
                          <a
                            href={localizeNavHref(item.href)}
                            aria-current={active ? "page" : undefined}
                          />
                        }
                      >
                        {m[item.labelKey]()}
                      </Menu.Item>
                    );
                  })}
                  <div className="my-1 h-px bg-border" />
                  <div className="px-2 py-1.5">
                    <SocialLinks />
                  </div>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>
    </header>
  );
}
