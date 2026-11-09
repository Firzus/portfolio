/**
 * The slice of Atelier's kernel that the Inspector demo runs: a behaviour on one object, Self,
 * fired by a key, with the conditions and instructions that act on Self alone. The rules follow
 * Atelier's runtime, so the demo behaves as Unity would.
 */

export interface SceneObject {
  exists: boolean;
  active: boolean;
}

export const initialObject: SceneObject = { exists: true, active: true };

export type ConditionType = "Is Active" | "Object Exists";
export type ConditionMode = "All" | "Any";

export interface ConditionNode {
  id: string;
  type: ConditionType;
}

export type InstructionNode =
  | { id: string; type: "Check Conditions"; mode: ConditionMode; conditions: ConditionNode[] }
  | { id: string; type: "Set Active"; active: boolean }
  | { id: string; type: "Toggle Active" }
  | { id: string; type: "Destroy" }
  | { id: string; type: "Wait"; seconds: number }
  | { id: string; type: "Log"; message: string };

export type InstructionType = InstructionNode["type"];

export type InputKey = "E" | "F" | "Q" | "Space";
export type InputPhase = "Pressed" | "Released";

export interface Behaviour {
  key: InputKey;
  on: InputPhase;
  instructions: InstructionNode[];
  /** Source of the next node id; ids stay unique however many nodes are added and removed. */
  nextId: number;
}

export const initialBehaviour: Behaviour = {
  key: "E",
  on: "Pressed",
  instructions: [
    {
      id: "n1",
      type: "Check Conditions",
      mode: "All",
      conditions: [{ id: "n2", type: "Is Active" }],
    },
    { id: "n3", type: "Set Active", active: false },
  ],
  nextId: 4,
};

/** What happened at one instruction of a run, in order. */
export type Step =
  | { kind: "run"; id: string; object: SceneObject }
  | { kind: "wait"; id: string; seconds: number }
  | { kind: "log"; id: string; message: string }
  | {
      kind: "stop";
      id: string;
      reason: "conditions-failed" | "host-disabled" | "host-destroyed";
      /** Self once the frame ends, when a Destroy earlier in the run removes it then. */
      object?: SceneObject;
    };

const destroyedObject: SceneObject = { exists: false, active: false };

/** Instructions that await the next frame before the run moves on; the others finish at once. */
const waitsForFrame: ReadonlySet<InstructionType> = new Set(["Set Active", "Log", "Wait"]);

/**
 * Whether the trigger hears its key. Atelier's trigger polls its event from the host's Update,
 * which Unity stops calling once the host is off or destroyed.
 */
export function listens(object: SceneObject): boolean {
  return object.exists && object.active;
}

function check(condition: ConditionNode, object: SceneObject): boolean {
  switch (condition.type) {
    case "Is Active":
      return object.exists && object.active;
    case "Object Exists":
      return object.exists;
  }
}

/** Atelier's condition gate: a list with nothing to ask lets the run through under both modes. */
export function passes(
  conditions: ConditionNode[],
  mode: ConditionMode,
  object: SceneObject,
): boolean {
  if (conditions.length === 0) return true;
  return mode === "All"
    ? conditions.every((condition) => check(condition, object))
    : conditions.some((condition) => check(condition, object));
}

/**
 * The steps of one run from `object`. Nothing outside the run changes Self while it waits, so the
 * whole run is worked out up front and then played step by step, as it stood when the key was
 * pressed.
 *
 * Turning the host off cancels the runs in flight at once, even at the last instruction. Destroy
 * only takes effect when the frame ends, so the run goes on until an instruction awaits the next
 * frame, and is cancelled then.
 */
export function plan(instructions: InstructionNode[], object: SceneObject): Step[] {
  const steps: Step[] = [];
  let current = object;
  let destroyedBy: string | undefined;
  for (const node of instructions) {
    switch (node.type) {
      case "Check Conditions":
        if (!passes(node.conditions, node.mode, current)) {
          steps.push({
            kind: "stop",
            id: node.id,
            reason: "conditions-failed",
            ...(destroyedBy && { object: destroyedObject }),
          });
          return steps;
        }
        steps.push({ kind: "run", id: node.id, object: current });
        break;
      case "Set Active":
        current = { ...current, active: node.active };
        steps.push({ kind: "run", id: node.id, object: current });
        break;
      case "Toggle Active":
        current = { ...current, active: !current.active };
        steps.push({ kind: "run", id: node.id, object: current });
        break;
      case "Destroy":
        destroyedBy ??= node.id;
        steps.push({ kind: "run", id: node.id, object: current });
        break;
      case "Wait":
        // With a Destroy pending, the frame ends before the wait can.
        if (!destroyedBy) steps.push({ kind: "wait", id: node.id, seconds: node.seconds });
        break;
      case "Log":
        steps.push({ kind: "log", id: node.id, message: node.message });
        break;
    }
    if (!current.active) {
      steps.push({
        kind: "stop",
        id: node.id,
        reason: "host-disabled",
        ...(destroyedBy && { object: destroyedObject }),
      });
      return steps;
    }
    if (destroyedBy && waitsForFrame.has(node.type)) {
      steps.push({ kind: "stop", id: node.id, reason: "host-destroyed", object: destroyedObject });
      return steps;
    }
  }
  if (destroyedBy) steps.push({ kind: "run", id: destroyedBy, object: destroyedObject });
  return steps;
}

/** The instruction a picker entry adds, with the defaults of its Atelier class. */
function newInstruction(type: InstructionType, id: string): InstructionNode {
  switch (type) {
    case "Check Conditions":
      return { id, type, mode: "All", conditions: [] };
    case "Set Active":
      return { id, type, active: true };
    case "Toggle Active":
    case "Destroy":
      return { id, type };
    case "Wait":
      return { id, type, seconds: 1 };
    case "Log":
      return { id, type, message: "Hello from Atelier" };
  }
}

export function addInstruction(behaviour: Behaviour, type: InstructionType): Behaviour {
  return {
    ...behaviour,
    instructions: [...behaviour.instructions, newInstruction(type, `n${behaviour.nextId}`)],
    nextId: behaviour.nextId + 1,
  };
}

export function addCondition(
  behaviour: Behaviour,
  checkId: string,
  type: ConditionType,
): Behaviour {
  return {
    ...behaviour,
    instructions: behaviour.instructions.map((node) =>
      node.id === checkId && node.type === "Check Conditions"
        ? { ...node, conditions: [...node.conditions, { id: `n${behaviour.nextId}`, type }] }
        : node,
    ),
    nextId: behaviour.nextId + 1,
  };
}

/** Removes an instruction, or a condition inside a Check Conditions. */
export function removeNode(behaviour: Behaviour, id: string): Behaviour {
  return {
    ...behaviour,
    instructions: behaviour.instructions
      .filter((node) => node.id !== id)
      .map((node) =>
        node.type === "Check Conditions"
          ? { ...node, conditions: node.conditions.filter((condition) => condition.id !== id) }
          : node,
      ),
  };
}

type InstructionFields = Partial<{
  mode: ConditionMode;
  active: boolean;
  seconds: number;
  message: string;
}>;

export function updateInstruction(
  behaviour: Behaviour,
  id: string,
  fields: InstructionFields,
): Behaviour {
  return {
    ...behaviour,
    instructions: behaviour.instructions.map((node) =>
      node.id === id ? ({ ...node, ...fields } as InstructionNode) : node,
    ),
  };
}
