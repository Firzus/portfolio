import { useEffect, useRef, useState, type RefObject } from "react";
import { LinkButton } from "../../../components/ui/button";
import { Provisional } from "../../../components/ui/Provisional";
import { person } from "../../../content";
import { href } from "../../types";
import { mailto } from "../lib/hooks";
import { PhoneMenu, type NavLink } from "../ui/PhoneMenu";

type RailProps = {
  /** On the home page the rail carries the page's h1 and its sentence; elsewhere it is the header bar. */
  home?: boolean;
  /** The pictures the rail crosses; it takes a scrim over them and the solid ground once they have passed. */
  over?: RefObject<HTMLElement | null>;
};

export function Rail({ home = false, over }: RailProps) {
  const rail = useRef<HTMLElement>(null);
  const [overPictures, setOverPictures] = useState(Boolean(over));

  useEffect(() => {
    const pictures = over?.current;
    if (!pictures) return;
    const update = () => {
      const railBottom = rail.current?.getBoundingClientRect().bottom ?? 0;
      setOverPictures(pictures.getBoundingClientRect().bottom > railBottom);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [over]);

  const base = home ? "" : href("b");
  const links: NavLink[] = [
    { label: "Projets", href: `${base}#projets` },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      ref={rail}
      data-slot="rail"
      data-state={overPictures ? "over" : "docked"}
      className="sticky top-0 z-30 px-6 transition-[background-color] duration-300 ease-out data-[state=docked]:bg-ground data-[state=over]:bg-ground/90 motion-reduce:transition-none"
    >
      <div className="flex min-h-18 items-center justify-between gap-6 py-3 xl:grid xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:gap-12">
        {home ? (
          <h1 className="font-display text-head font-bold">
            {person.name}, <span className="whitespace-nowrap">{person.title}</span>
          </h1>
        ) : (
          <p className="font-display text-lead font-bold">
            <a href={href("b")} className="hover:text-muted transition-colors duration-150">
              {person.name}, <span className="whitespace-nowrap">{person.title}</span>
            </a>
          </p>
        )}

        {home ? (
          <p className="hidden max-w-[44ch] text-body xl:block">
            <Provisional value={person.lead} />
          </p>
        ) : (
          <span aria-hidden className="hidden xl:block" />
        )}

        <nav aria-label="Navigation principale" className="flex items-center">
          <ul className="hidden items-center gap-8 text-small xl:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  className="underline decoration-1 underline-offset-4 transition-colors duration-150 hover:decoration-2"
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
            {home && (
              <li>
                <LinkButton size="sm" href={mailto(person.email)}>
                  Écrire un e-mail
                </LinkButton>
              </li>
            )}
          </ul>
          <PhoneMenu
            className="xl:hidden"
            links={[...links, { label: "Écrire un e-mail", href: mailto(person.email) }]}
          />
        </nav>
      </div>
    </header>
  );
}
