import {
  Clock,
  Cube,
  Eye,
  Gamepad,
  GitFork,
  Play,
  Prohibition,
  Terminal,
  Trash,
} from "iconoir-react";
import { useEffect, useRef, useState } from "react";
import type * as React from "react";
import { cn } from "../../lib/utils";
import { m } from "../../paraglide/messages.js";
import { getLocale } from "../../paraglide/runtime.js";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  addCondition,
  addInstruction,
  initialBehaviour,
  initialObject,
  listens,
  plan,
  removeNode,
  updateInstruction,
  type ConditionNode,
  type ConditionType,
  type InputKey,
  type InputPhase,
  type InstructionNode,
  type InstructionType,
  type Step,
} from "./behaviour";
import { ChoiceField, NumberField, StaticField, TextField } from "./fields";
import { editorLabels, keyLabels, keyValues } from "./labels";
import { NodeCard } from "./NodeCard";
import { NodePicker } from "./NodePicker";
import { ScenePreview } from "./ScenePreview";

const runnableInstructions: InstructionType[] = [
  "Check Conditions",
  "Set Active",
  "Toggle Active",
  "Destroy",
  "Wait",
  "Log",
];
const runnableConditions: ConditionType[] = ["Is Active", "Object Exists"];

const icons: Record<
  InstructionType | ConditionType,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  "Check Conditions": GitFork,
  "Set Active": Eye,
  "Toggle Active": Eye,
  Destroy: Trash,
  Wait: Clock,
  Log: Terminal,
  "Is Active": Eye,
  "Object Exists": Cube,
};

/** The summary Atelier prints beside a node's title (its `Summary` property). */
function summary(node: InstructionNode): string | undefined {
  switch (node.type) {
    case "Check Conditions": {
      const count = node.conditions.length;
      return `${node.mode}, ${count} item${count === 1 ? "" : "s"}`;
    }
    case "Set Active":
      return `Self to ${node.active ? "True" : "False"}`;
    case "Toggle Active":
    case "Destroy":
      return "Self";
    case "Wait":
      return `${node.seconds}s, Game`;
    case "Log":
      return node.message;
  }
}

/**
 * A working copy of Atelier's Inspector beside a scene holding Self: the visitor edits the
 * behaviour, presses its key and watches the run act on Self. Rendered by the server in its
 * starting state, so the page reads the same without JavaScript.
 */
export function AtelierDemo({ className }: { className?: string }) {
  const [behaviour, setBehaviour] = useState(initialBehaviour);
  const [object, setObject] = useState(initialObject);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  // A run outlives renders while it waits; the timer and the busy flag live outside the state.
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const busy = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const keyName = keyLabels[behaviour.key];
  const log = (line: string) => setLines((previous) => [...previous, line].slice(-5));

  function play(steps: Step[], from: number) {
    for (let index = from; index < steps.length; index++) {
      const step = steps[index];
      if (!step) break;
      switch (step.kind) {
        case "run":
          setObject(step.object);
          break;
        case "log":
          log(step.message);
          break;
        case "wait":
          setRunningId(step.id);
          timer.current = setTimeout(() => {
            setRunningId(null);
            play(steps, index + 1);
          }, step.seconds * 1000);
          return;
        case "stop":
          log(
            step.reason === "conditions-failed"
              ? m.demo_log_conditions()
              : step.reason === "host-disabled"
                ? m.demo_log_disabled()
                : m.demo_log_destroyed(),
          );
          busy.current = false;
          return;
      }
    }
    log(m.demo_log_done());
    busy.current = false;
  }

  function fire() {
    if (!listens(object)) {
      log(m.demo_log_not_listening({ key: keyName }));
      return;
    }
    // The trigger's run policy is Ignore: a press while a run is in flight starts nothing.
    if (busy.current) {
      log(m.demo_log_busy({ key: keyName }));
      return;
    }
    busy.current = true;
    log(m.demo_log_started({ key: keyName }));
    play(plan(behaviour.instructions, object), 0);
  }

  function resetScene() {
    clearTimeout(timer.current);
    busy.current = false;
    setRunningId(null);
    setObject(initialObject);
    setLines([]);
  }

  function onKey(event: React.KeyboardEvent, phase: InputPhase) {
    if (event.key !== keyValues[behaviour.key] || phase !== behaviour.on || event.repeat) return;
    const target = event.target as HTMLElement;
    // Typing in a field, or choosing in an open control, is not the game's input.
    if (target.closest("input, textarea, [role='combobox'], [role='listbox']")) return;
    event.preventDefault();
    fire();
  }

  const edit = (next: typeof behaviour) => setBehaviour(next);

  return (
    <div
      data-atelier-demo
      role="group"
      aria-label={m.demo_label()}
      // Focusable, so a click inside the frame lets its key reach the trigger.
      tabIndex={-1}
      onKeyDown={(event) => onKey(event, "Pressed")}
      onKeyUp={(event) => onKey(event, "Released")}
      className={cn("flex flex-col gap-4 outline-none", className)}
    >
      <p className="text-small text-ink">{m.demo_hint({ key: keyName })}</p>
      {/* data-ui tells the design inspector (inspect.mjs) this reproduces an interface: it
          counts as a picture and keeps Unity's own sizes, labels and lines. */}
      <div
        data-atelier-inspector
        data-ui
        lang="en"
        className="flex flex-col gap-2 rounded-lg bg-editor-window p-3 text-caption text-editor-ink"
      >
        <p className="text-label text-editor-muted uppercase">{editorLabels.whenHeading}</p>
        <NodeCard
          title={editorLabels.onInputButton}
          summary={behaviour.on}
          Icon={Gamepad}
          defaultOpen
        >
          <StaticField label={editorLabels.button} value={editorLabels.keyboardKey} />
          <ChoiceField
            label={editorLabels.key}
            indent
            value={behaviour.key}
            items={(Object.keys(keyLabels) as InputKey[]).map((key) => ({
              value: key,
              label: keyLabels[key],
            }))}
            onChange={(key) => edit({ ...behaviour, key })}
          />
          <ChoiceField
            label={editorLabels.on}
            value={behaviour.on}
            items={[
              { value: "Pressed" as const, label: "Pressed" },
              { value: "Released" as const, label: "Released" },
            ]}
            onChange={(on) => edit({ ...behaviour, on })}
          />
        </NodeCard>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-label text-editor-muted uppercase">{editorLabels.thenHeading}</p>
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1 rounded-sm bg-editor-card px-1.5 py-0.5 text-editor-muted">
              <Prohibition aria-hidden="true" className="size-3.5" />
              {editorLabels.ignore}
            </span>
            <button
              type="button"
              onClick={fire}
              aria-label={m.demo_run()}
              lang={getLocale()}
              className="grid size-6 place-items-center rounded-sm bg-editor-card hover:bg-editor-card-hover"
            >
              <Play aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        </div>

        {behaviour.instructions.map((node) => (
          <NodeCard
            key={node.id}
            title={node.type}
            summary={summary(node)}
            Icon={icons[node.type]}
            onRemove={() => edit(removeNode(behaviour, node.id))}
            defaultOpen={node.type === "Check Conditions"}
            running={runningId === node.id}
          >
            <InstructionFields
              node={node}
              onChange={(fields) => edit(updateInstruction(behaviour, node.id, fields))}
              onAddCondition={(type) => edit(addCondition(behaviour, node.id, type))}
              onRemoveCondition={(id) => edit(removeNode(behaviour, id))}
            />
          </NodeCard>
        ))}
        <NodePicker
          kind="instruction"
          runnable={runnableInstructions}
          onPick={(type) => edit(addInstruction(behaviour, type))}
        />
      </div>
      <ScenePreview
        object={object}
        lines={lines}
        keyName={keyName}
        onPress={fire}
        onReset={resetScene}
      />
    </div>
  );
}

interface InstructionFieldsProps {
  node: InstructionNode;
  onChange: (fields: Parameters<typeof updateInstruction>[2]) => void;
  onAddCondition: (type: ConditionType) => void;
  onRemoveCondition: (id: string) => void;
}

function InstructionFields({
  node,
  onChange,
  onAddCondition,
  onRemoveCondition,
}: InstructionFieldsProps) {
  switch (node.type) {
    case "Check Conditions":
      return (
        <>
          <div className="flex items-center justify-between">
            <p className="text-label text-editor-muted uppercase">{editorLabels.ifHeading}</p>
            <ToggleGroup
              value={[node.mode]}
              onValueChange={(value) => {
                const mode = value[0];
                if (mode === "All" || mode === "Any") onChange({ mode });
              }}
              className="bg-editor-recess"
            >
              <ToggleGroupItem value="All" className="data-pressed:bg-editor-control">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="Any" className="data-pressed:bg-editor-control">
                Any
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {node.conditions.map((condition: ConditionNode) => (
            <NodeCard
              key={condition.id}
              title={condition.type}
              summary={condition.type === "Object Exists" ? "Self" : undefined}
              Icon={icons[condition.type]}
              nested
              onRemove={() => onRemoveCondition(condition.id)}
            >
              <StaticField label={editorLabels.target} value={editorLabels.self} />
            </NodeCard>
          ))}
          <NodePicker kind="condition" runnable={runnableConditions} onPick={onAddCondition} />
        </>
      );
    case "Set Active":
      return (
        <>
          <StaticField label={editorLabels.target} value={editorLabels.self} />
          <ChoiceField
            label={editorLabels.active}
            value={node.active ? "True" : "False"}
            items={[
              { value: "True" as const, label: "True" },
              { value: "False" as const, label: "False" },
            ]}
            onChange={(value) => onChange({ active: value === "True" })}
          />
        </>
      );
    case "Toggle Active":
    case "Destroy":
      return <StaticField label={editorLabels.target} value={editorLabels.self} />;
    case "Wait":
      return (
        <>
          <NumberField
            label={editorLabels.seconds}
            value={node.seconds}
            min={0}
            max={10}
            step={0.5}
            onChange={(seconds) => onChange({ seconds })}
          />
          <StaticField label={editorLabels.time} value={editorLabels.game} />
        </>
      );
    case "Log":
      return (
        <TextField
          label={editorLabels.message}
          value={node.message}
          onChange={(message) => onChange({ message })}
        />
      );
  }
}
