import { Menu } from "@base-ui/react/menu";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { person, projects } from "../../../content";
import { cn } from "../../../lib/utils";
import { useReveal } from "../../../lib/motion";
import { href } from "../../types";
import { gutter } from "./kit";
import { ShaderButton } from "../shaders/ShaderLayer";
import { FluidDefs, useLiquidPill } from "../motion/fluid";
import { useFluidPage } from "../motion/page";
import { Loader } from "../motion/Loader";
import { ScrollBar } from "../motion/ScrollBar";

export const mailto = `mailto:${person.email}?subject=${encodeURIComponent("Contact depuis le portfolio")}`;

type NavItem = { label: string; href: string; current?: boolean };

const nav = (current: "accueil" | "projets"): NavItem[] => [
  { label: "Accueil", href: href("d"), current: current === "accueil" },
  { label: "Projets", href: `${href("d")}#projets`, current: current === "projets" },
  { label: "À propos", href: `${href("d")}#a-propos` },
  { label: "Contact", href: `${href("d")}#contact` },
];

/** The framed column every page sits in, with the announcement, header and footer. */
export function Frame({ current, children }: { current: "accueil" | "projets"; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  useFluidPage();
  return (
    <div ref={root} className="mx-auto min-h-svh max-w-352 border-x border-ink/8 bg-ground md:w-[calc(100%-1rem)]">
      <FluidDefs />
      <Loader />
      <ScrollBar />
      <Header items={nav(current)} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function Header({ items }: { items: NavItem[] }) {
  const list = useRef<HTMLUListElement>(null);
  const pill = useLiquidPill(list, "[data-slot='nav-link']", items.findIndex((item) => item.current));
  return (
    <header className={cn(gutter, "flex h-16 items-center justify-between gap-6 border-b border-ink/8 [view-transition-name:d-header]")}>
      <div className="flex items-center gap-6">
        <a href={href("d")} className="flex items-center gap-2.5">
          <span aria-hidden className="grid size-7 place-items-center rounded-md bg-ink text-[0.6875rem] font-bold tracking-tight text-ground">
            LP
          </span>
          <span className="text-[0.95rem] font-semibold tracking-tight">Lilian PRIEU</span>
        </a>
        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul ref={list} className="relative isolate flex items-center gap-1">
            {/* Lead and trail of the liquid pill, merged by the goo filter. */}
            <span ref={pill} aria-hidden className="pointer-events-none absolute inset-0 -z-10 [filter:url(#d-goo)]">
              <span className="absolute top-0 left-0 rounded-md bg-pill opacity-0" />
              <span className="absolute top-0 left-0 rounded-md bg-pill opacity-0" />
            </span>
            {items.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  data-slot="nav-link"
                  aria-current={item.current ? "page" : undefined}
                  className="block rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium text-ink/60 transition-colors duration-150 hover:text-ink aria-[current=page]:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <a href={person.links[1].href} className="hidden text-[0.8125rem] font-medium text-ink/60 hover:text-ink lg:inline">
          GitHub
        </a>
        <a href={person.links[0].href} className="hidden text-[0.8125rem] font-medium text-ink/60 hover:text-ink lg:inline">
          LinkedIn
        </a>
        <ShaderButton href={mailto} className="hidden h-8 rounded-lg px-3.5 text-[0.8125rem] sm:inline-flex">
          Écrire à Lilian
        </ShaderButton>
        <PhoneMenu items={items} />
      </div>
    </header>
  );
}

// taste-skill-ignore: the popup floats over the page, so it keeps the outline and shade of a real overlay.
const popup =
  "min-w-56 origin-(--transform-origin) rounded-xl border border-ink/12 bg-ground p-1.5 font-text text-ink shadow-2xl outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none"; // taste-skill-ignore

/** Below md the nav collapses into a Base UI menu; prerendered, it is the plain list of links. */
function PhoneMenu({ items }: { items: NavItem[] }) {
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);

  if (!enhanced) {
    return (
      <nav aria-label="Navigation principale" className="md:hidden">
        <ul className="flex gap-3 text-[0.8125rem] text-ink/70">
          {items.slice(1).map((item) => (
            <li key={item.label}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <Menu.Root>
      <Menu.Trigger className="inline-flex h-8 items-center rounded-lg border border-ink/12 px-3 text-[0.8125rem] font-medium md:hidden data-popup-open:bg-ink/10">
        Menu
      </Menu.Trigger>
      <Menu.Portal>
        {/* Portalled out of the piste root, so the positioner carries the piste's tokens itself. */}
        <Menu.Positioner data-piste="d" className="z-50 outline-none" sideOffset={8} align="end">
          <Menu.Popup className={popup}>
            {[...items, { label: "Écrire à Lilian", href: mailto }].map((item) => (
              <Menu.LinkItem
                key={item.label}
                href={item.href}
                className="flex h-11 items-center rounded-lg px-3 text-sm font-medium outline-none select-none data-highlighted:bg-ink/10"
              >
                {item.label}
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function Footer() {
  const columns: { title: string; links: { label: string; href: string }[] }[] = [
    { title: "Projets", links: projects.map((p) => ({ label: p.name, href: href("d", p.slug) })) },
    {
      title: "Sites",
      links: projects.flatMap((p) => p.links).filter((l) => l.href.startsWith("http")),
    },
    { title: "Contact", links: [{ label: "E-mail", href: mailto }, ...person.links] },
  ];
  return (
    <footer>
      <div className={cn(gutter, "grid grid-cols-2 gap-10 py-14 md:grid-cols-3")}>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-[0.8125rem] font-medium text-ink/55">{column.title}</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-[0.8125rem] text-ink/70">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-ink">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={cn(gutter, "flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 py-5 text-[0.8125rem] text-ink/55")}>
        <span>{person.name} · {person.title}</span>
        <span>Prototype FIR-419</span>
      </div>
    </footer>
  );
}
