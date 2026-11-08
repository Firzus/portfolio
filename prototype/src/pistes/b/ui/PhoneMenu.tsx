import { Menu } from "@base-ui/react/menu";
import { buttonVariants } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { useEnhanced } from "../lib/hooks";

export type NavLink = { label: string; href: string };

/**
 * Navigation below the desktop rail. Prerendered as plain links; once hydrated it becomes a
 * Base UI menu so the rail keeps one line beside the title.
 */
export function PhoneMenu({ links, className }: { links: NavLink[]; className?: string }) {
  const enhanced = useEnhanced();

  if (!enhanced) {
    return (
      <ul data-slot="phone-menu" className={cn("flex flex-col items-end gap-1 text-small", className)}>
        {links.map((link) => (
          <li key={link.href}>
            <a className="underline underline-offset-4" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        data-slot="phone-menu"
        className={cn(buttonVariants({ variant: "inverse", size: "sm" }), "bg-surface data-popup-open:bg-ink data-popup-open:text-ground", className)}
      >
        Menu
      </Menu.Trigger>
      <Menu.Portal>
        {/* The popup is portalled out of the piste root, so it carries the piste's tokens itself. */}
        <Menu.Positioner data-piste="b" className="z-50 outline-none" sideOffset={10} align="end">
          <Menu.Popup className="min-w-60 origin-(--transform-origin) bg-surface py-2 font-text text-body text-ink outline-none transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 motion-reduce:transition-none">
            {links.map((link) => (
              <Menu.LinkItem
                key={link.href}
                href={link.href}
                className="flex h-12 items-center px-5 outline-none select-none data-highlighted:bg-ink data-highlighted:text-ground"
              >
                {link.label}
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
