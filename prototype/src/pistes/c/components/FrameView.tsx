import type { ComponentProps } from "react";
import { cn } from "../../../lib/utils";
import { cropStyle, type Frame } from "../frames";

type FrameViewProps = ComponentProps<"span"> & {
  frame: Frame;
  /** Width / height of the box the frame is shown in, used to place detail crops. */
  boxAspect: number;
  /** Decorative frames (repeated elsewhere with their text) get an empty alt. */
  decorative?: boolean;
  eager?: boolean;
  /** Slow drift on the picture itself; whole pictures only. */
  drift?: boolean;
};

/** One square-cornered frame of the contact sheet. It fills its box; the caller sets the size. */
export function FrameView({ frame, boxAspect, decorative, eager, drift, className, ...props }: FrameViewProps) {
  return (
    <span data-slot="frame" className={cn("relative block overflow-hidden bg-surface", className)} {...props}>
      {frame.type === "picture" && frame.crop && (
        <span
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : frame.alt}
          className="absolute inset-0 bg-no-repeat"
          style={cropStyle(frame.crop, frame.picture, boxAspect)}
        />
      )}
      {frame.type === "picture" && !frame.crop && (
        <img
          src={frame.picture.src}
          alt={decorative ? "" : frame.alt}
          width={frame.picture.width}
          height={frame.picture.height}
          loading={eager ? undefined : "lazy"}
          decoding="async"
          className={cn("absolute inset-0 size-full object-cover", drift && "c-drift")}
        />
      )}
      {frame.type === "atelier-mark" && (
        <span className="absolute inset-0 grid place-items-center bg-field">
          <img src="/assets/atelier-mark.svg" alt={decorative ? "" : frame.alt} width={100} height={100} className="h-3/5 w-auto" />
        </span>
      )}
      {frame.type === "atelier-ui" && <AtelierBehaviour />}
    </span>
  );
}

/**
 * Atelier's structure as the project describes it: one behaviour is a trigger, conditions, then
 * instructions in order. Only the three parts are named; no API or field name is made up.
 */
function AtelierBehaviour() {
  const parts = [
    { label: "Déclencheur", detail: "quand…" },
    { label: "Conditions", detail: "si…" },
    { label: "Instructions", detail: "alors, dans l'ordre" },
  ];
  return (
    <span data-ui="" aria-hidden="true" className="absolute inset-0 flex flex-col justify-center gap-1 bg-field p-[8%] text-field-ink">
      {parts.map((part) => (
        <span key={part.label} className="c-ui-row flex items-baseline justify-between gap-2 px-2 py-1">
          <span className="truncate text-small font-semibold">{part.label}</span>
          <span className="c-ui-detail truncate text-small max-sm:hidden">{part.detail}</span>
        </span>
      ))}
    </span>
  );
}
