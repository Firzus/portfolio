import { cn } from "../../../lib/utils";

const blocks = [
  { title: "Déclencheur", slot: "Quand ce comportement démarre" },
  { title: "Conditions", slot: "Ce qui doit être vrai" },
  { title: "Instructions", slot: "Ce qui se passe, dans l'ordre" },
];

/**
 * Interface fragment drawn from Atelier's own description (trigger, conditions, then ordered
 * instructions, assembled in the Inspector or in C#). It is a picture, so it is one image to
 * assistive technology.
 */
export function AtelierUi({ className }: { className?: string }) {
  return (
    <div
      data-ui
      data-slot="atelier-ui"
      role="img"
      aria-label="Schéma d'un comportement Atelier dans l'Inspector de Unity : un déclencheur, des conditions, puis des instructions dans l'ordre."
      className={cn("flex size-full flex-col justify-center gap-3 p-5 text-small md:p-10 md:text-body", className)}
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-extrabold">Inspector</span>
        <span className="a-ui-soft">Unity 6, URP</span>
      </div>
      <div className="a-ui-row px-4 py-3 font-medium">Comportement</div>
      <ol className="flex flex-col gap-2">
        {blocks.map((b) => (
          <li key={b.title} className="a-ui-row flex flex-wrap items-baseline justify-between gap-x-4 px-4 py-3 md:py-5">
            <span className="font-extrabold">{b.title}</span>
            <span className="a-ui-soft">{b.slot}</span>
          </li>
        ))}
      </ol>
      <div className="flex items-baseline justify-between gap-4">
        <span className="a-ui-soft">Le même noyau</span>
        <span className="font-medium">Inspector ou API C#</span>
      </div>
    </div>
  );
}
