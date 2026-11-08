import { Tabs } from "@base-ui/react/tabs";
import type { Picture } from "../../../content";
import { useEnhanced } from "../lib/hooks";

function Screen({ picture, eager = false }: { picture: Picture; eager?: boolean }) {
  return (
    <figure data-slot="screen">
      <img
        src={picture.src}
        alt={picture.alt}
        width={picture.width}
        height={picture.height}
        loading={eager ? undefined : "lazy"}
        className="aspect-[16/10] w-full bg-surface object-cover object-top"
      />
      <figcaption className="mt-3 text-small text-muted">{picture.caption}</figcaption>
    </figure>
  );
}

/**
 * A project's screens: one large screen chosen from a strip of thumbnails. Prerendered as the
 * plain list of every screen; once hydrated it becomes Base UI tabs.
 */
export function ScreenTabs({ label, pictures }: { label: string; pictures: Picture[] }) {
  const enhanced = useEnhanced();

  if (!enhanced) {
    return (
      <div data-slot="screen-tabs" className="flex flex-col gap-16">
        {pictures.map((picture) => (
          <Screen key={picture.src} picture={picture} />
        ))}
      </div>
    );
  }

  return (
    <Tabs.Root data-slot="screen-tabs" defaultValue={0} className="flex flex-col">
      <Tabs.List aria-label={label} className="order-2 mt-6 grid grid-cols-3 gap-3 md:gap-6">
        {pictures.map((picture, i) => (
          <Tabs.Tab
            key={picture.src}
            value={i}
            aria-label={picture.caption}
            className="group flex cursor-pointer flex-col gap-2 text-left text-small text-muted outline-none transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus data-active:text-ink"
          >
            <img
              src={picture.src}
              alt=""
              width={picture.width}
              height={picture.height}
              loading="lazy"
              className="aspect-[16/10] w-full bg-surface object-cover object-top opacity-50 transition-opacity duration-200 ease-out group-hover:opacity-80 group-data-active:opacity-100 motion-reduce:transition-none"
            />
            <span className="hidden md:block">{picture.caption}</span>
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {pictures.map((picture, i) => (
        <Tabs.Panel key={picture.src} value={i} className="order-1 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
          <Screen picture={picture} eager />
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
