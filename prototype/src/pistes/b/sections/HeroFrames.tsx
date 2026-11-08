import type { Ref } from "react";
import { LinkButton } from "../../../components/ui/button";
import { Provisional } from "../../../components/ui/Provisional";
import { findProject, person } from "../../../content";
import { mailto, useCycle } from "../lib/hooks";

const lysandra = findProject("lysandra")!.pictures[0];
const huzounet = findProject("huzounet")!.pictures;

/**
 * Two full-bleed frames under the rail: Lysandra's sky, then Huzounet's screens crossfading in
 * the same framing. The rail is laid out by the page so it can stay docked after these pass.
 */
export function HeroFrames({ ref }: { ref?: Ref<HTMLDivElement> }) {
  const shown = useCycle(huzounet.length, 7100);

  return (
    <div ref={ref} data-slot="hero-frames" className="absolute inset-x-0 top-0 z-0 h-[200svh] overflow-hidden">
      <div className="relative h-svh overflow-hidden">
        {/* Raised and enlarged so the site's own title card sits exactly behind the rail. */}
        <div className="absolute inset-0 -translate-y-[7%] scale-[1.15]">
          <img
            data-slot="hero-drift"
            src={lysandra.src}
            alt={lysandra.alt}
            width={lysandra.width}
            height={lysandra.height}
            fetchPriority="high"
            className="size-full object-cover object-[78%_50%] md:object-center"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-ground/95 px-5 pt-6 pb-8 md:px-6 xl:hidden">
          <p className="max-w-[44ch] text-body">
            <Provisional value={person.lead} />
          </p>
          <LinkButton className="mt-5 w-full md:w-auto" href={mailto(person.email)}>
            Écrire un e-mail
          </LinkButton>
        </div>
      </div>

      <div className="relative h-svh overflow-hidden bg-ground">
        {huzounet.map((picture, i) => (
          <img
            key={picture.src}
            src={picture.src}
            alt={picture.alt}
            width={picture.width}
            height={picture.height}
            loading="lazy"
            aria-hidden={i === shown ? undefined : true}
            data-state={i === shown ? "active" : "idle"}
            className="absolute inset-0 size-full scale-105 object-cover object-[72%_0%] opacity-0 md:object-top transition-opacity duration-[1600ms] ease-out data-[state=active]:opacity-100 motion-reduce:transition-none"
          />
        ))}
      </div>
    </div>
  );
}
