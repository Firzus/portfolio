import { Tabs } from "@base-ui/react/tabs";
import type { CSSProperties } from "react";
import type { Frame } from "../frames";
import { FrameView } from "./FrameView";

/**
 * A project's frames as a contact sheet with a loupe: the row of thumbnails picks which frame is
 * shown large. Without JavaScript the row is hidden and every panel is shown, one under another.
 */
export function Loupe({ frames, label }: { frames: Frame[]; label: string }) {
  return (
    <Tabs.Root data-slot="loupe" defaultValue={frames[0].id} className="flex flex-col gap-5">
      <Tabs.List
        aria-label={label}
        style={{ "--c-count": frames.length } as CSSProperties}
        className="c-needs-js grid grid-cols-4 gap-x-2 gap-y-4 lg:grid-cols-[repeat(var(--c-count),minmax(0,1fr))]"
      >
        {frames.map((frame) => (
          <Tabs.Tab
            key={frame.id}
            value={frame.id}
            data-reveal=""
            aria-label={frame.caption}
            className="group/tab relative cursor-pointer text-left"
          >
            <FrameView
              frame={frame}
              boxAspect={1.25}
              decorative
              eager
              className="aspect-[5/4] w-full transition-transform duration-200 ease-out group-active/tab:scale-[0.97] motion-reduce:transition-none"
            />
            <span
              aria-hidden="true"
              className="absolute inset-x-0 -bottom-2 h-1 scale-x-0 bg-ink transition-transform duration-200 group-hover/tab:scale-x-50 group-data-[active]/tab:scale-x-100 motion-reduce:transition-none"
            />
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {frames.map((frame, index) => (
        <Tabs.Panel
          key={frame.id}
          value={frame.id}
          keepMounted
          data-slot="loupe-panel"
          className="c-loupe-panel grid gap-x-6 gap-y-3 lg:grid-cols-12"
        >
          <figure className="contents">
            <div className="overflow-hidden lg:col-span-9">
              <FrameView frame={frame} boxAspect={1.6} eager={index === 0} className="c-drift aspect-[16/10] w-full" />
            </div>
            <figcaption className="text-body lg:col-span-3 lg:self-end">{frame.caption}</figcaption>
          </figure>
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
