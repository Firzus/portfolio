import { Cube, Refresh } from "iconoir-react";
import { m } from "../../paraglide/messages.js";
import type { SceneObject } from "./behaviour";

interface ScenePreviewProps {
  object: SceneObject;
  lines: { id: number; text: string }[];
  keyName: string;
  onPress: () => void;
  onReset: () => void;
}

/**
 * The foot of the editor window: the scene object Self in its state after the last run, the last
 * line of the console, and the controls to run and reset. Kept to one strip so the Inspector
 * stays the subject.
 */
export function ScenePreview({ object, lines, keyName, onPress, onReset }: ScenePreviewProps) {
  const state = !object.exists ? "destroyed" : object.active ? "active" : "inactive";
  const last = lines.at(-1);
  return (
    <section
      aria-label={m.demo_scene()}
      className="flex items-center gap-3 border-t border-editor-line bg-editor-recess px-3 py-2.5 text-caption text-editor-ink"
    >
      <div
        data-object-state={state}
        className="grid size-9 shrink-0 place-items-center rounded-sm border border-editor-line bg-editor-card data-[object-state=destroyed]:border-dashed"
      >
        {object.exists && (
          <Cube
            aria-hidden="true"
            className={object.active ? "size-5 text-accent" : "size-5 text-editor-muted/40"}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p aria-live="polite">
          {state === "active"
            ? m.demo_object_active()
            : state === "inactive"
              ? m.demo_object_inactive()
              : m.demo_object_destroyed()}
        </p>
        <p aria-live="polite" className="truncate text-editor-muted">
          <span className="sr-only">{m.demo_console()} : </span>
          {last ? last.text : m.demo_console_empty()}
        </p>
      </div>
      <button
        type="button"
        onClick={onPress}
        className="h-7 shrink-0 rounded-sm bg-editor-control px-2.5 font-medium hover:bg-editor-control-hover"
      >
        {m.demo_press({ key: keyName })}
      </button>
      <button
        type="button"
        onClick={onReset}
        aria-label={m.demo_reset()}
        className="grid size-7 shrink-0 place-items-center rounded-sm hover:bg-editor-card-hover"
      >
        <Refresh aria-hidden="true" className="size-3.5" />
      </button>
    </section>
  );
}
