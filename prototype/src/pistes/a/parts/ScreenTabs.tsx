import { Tabs } from "@base-ui/react/tabs";
import { useEffect, useState, type ReactNode } from "react";
import type { Picture } from "../../../content";
import { cn } from "../../../lib/utils";

export type ScreenItem = {
  id: string;
  label: string;
  thumb: Picture;
  /** Crop of the thumbnail, when it is taken from a picture wider than the frame. */
  thumbPosition?: string;
  content: ReactNode;
};

/**
 * The frame holds still and its screen changes, chosen from the list beside it. The prerendered
 * page (and the first client render, so hydration matches) shows every screen stacked with its
 * caption; the tabs take over once React has hydrated.
 */
export function ScreenTabs({ items, aside }: { items: ScreenItem[]; aside?: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated || items.length < 2) {
    return (
      <div data-slot="screens" className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-16 lg:col-span-8">
          {items.map((item) => (
            <figure key={item.id}>
              {item.content}
              <figcaption className="mt-3 text-small">{item.label}</figcaption>
            </figure>
          ))}
        </div>
        {aside && <div className="lg:col-span-4">{aside}</div>}
      </div>
    );
  }

  return (
    <Tabs.Root data-slot="screens" defaultValue={items[0].id} className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {items.map((item) => (
          <Tabs.Panel key={item.id} value={item.id} keepMounted data-slot="screen-panel" className="outline-offset-4">
            {item.content}
          </Tabs.Panel>
        ))}
      </div>
      <div className="flex flex-col gap-12 lg:col-span-4">
        <Tabs.List activateOnFocus aria-label="Écrans du projet" className="flex flex-col gap-2">
          {items.map((item) => (
            <Tabs.Tab
              key={item.id}
              value={item.id}
              data-slot="screen-tab"
              className={cn(
                "group flex items-center gap-4 py-2 text-left text-body font-medium text-muted transition-[color,transform] duration-150",
                "hover:text-ink active:scale-[0.98] data-[active]:font-extrabold data-[active]:text-ink",
                "motion-reduce:transition-none motion-reduce:active:scale-100",
              )}
            >
              <img
                src={item.thumb.src}
                alt=""
                width={176}
                height={110}
                loading="lazy"
                className={cn(
                  "a-ratio-screen w-44 shrink-0 bg-ink object-cover outline-4 -outline-offset-4 outline-transparent transition-[outline-color] duration-150",
                  "group-hover:outline-field/50 group-data-[active]:outline-field motion-reduce:transition-none",
                  item.thumbPosition,
                )}
              />
              <span>{item.label}</span>
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {aside}
      </div>
    </Tabs.Root>
  );
}
