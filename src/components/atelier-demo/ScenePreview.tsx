import { Cube, Refresh } from "iconoir-react";
import { m } from "../../paraglide/messages.js";
import { buttonVariants } from "../ui/link-button";
import type { SceneObject } from "./behaviour";
import { editorLabels } from "./labels";

interface ScenePreviewProps {
  object: SceneObject;
  lines: { id: number; text: string }[];
  keyName: string;
  onPress: () => void;
  onReset: () => void;
}

/** The scene that holds Self, its state after the last run, and the console of the runs. */
export function ScenePreview({ object, lines, keyName, onPress, onReset }: ScenePreviewProps) {
  const state = !object.exists ? "destroyed" : object.active ? "active" : "inactive";
  return (
    <section
      aria-label={m.demo_scene()}
      className="flex flex-col gap-3 rounded-lg bg-ground/60 p-3"
    >
      <div className="flex items-center gap-4">
        <div
          data-object-state={state}
          className="grid size-16 shrink-0 place-items-center rounded-md border border-line bg-surface data-[object-state=destroyed]:border-dashed"
        >
          {object.exists && (
            <Cube
              aria-hidden="true"
              className={object.active ? "size-9 text-accent" : "size-9 text-muted/40"}
            />
          )}
        </div>
        <div className="min-w-0">
          <p lang="en" className="font-medium">
            {editorLabels.self}
          </p>
          <p className="text-small text-muted" aria-live="polite">
            {state === "active"
              ? m.demo_object_active()
              : state === "inactive"
                ? m.demo_object_inactive()
                : m.demo_object_destroyed()}
          </p>
        </div>
      </div>
      <div>
        <p className="text-caption font-medium text-muted">{m.demo_console()}</p>
        <ol
          aria-live="polite"
          className="mt-1 min-h-20 rounded-md bg-editor-window p-2 text-caption text-editor-ink"
        >
          {lines.length === 0 ? (
            <li className="text-editor-muted">{m.demo_console_empty()}</li>
          ) : (
            lines.map((line) => <li key={line.id}>{line.text}</li>)
          )}
        </ol>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onPress} className={buttonVariants({ size: "sm" })}>
          {m.demo_press({ key: keyName })}
        </button>
        <button
          type="button"
          onClick={onReset}
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          <Refresh aria-hidden="true" className="size-3.5" />
          {m.demo_reset()}
        </button>
      </div>
    </section>
  );
}
