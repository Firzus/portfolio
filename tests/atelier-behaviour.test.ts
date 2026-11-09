import { describe, expect, test } from "vite-plus/test";
import {
  addCondition,
  addInstruction,
  initialBehaviour,
  initialObject,
  listens,
  passes,
  plan,
  removeNode,
  updateInstruction,
  type Behaviour,
  type ConditionNode,
  type InstructionNode,
  type SceneObject,
} from "../src/components/atelier-demo/behaviour";

const active: SceneObject = { exists: true, active: true };
const inactive: SceneObject = { exists: true, active: false };

const isActive: ConditionNode = { id: "c1", type: "Is Active" };
const exists: ConditionNode = { id: "c2", type: "Object Exists" };

describe("the trigger", () => {
  test("listens while Self is active, and stops once it is off or destroyed", () => {
    expect(listens(active)).toBe(true);
    expect(listens(inactive)).toBe(false);
    expect(listens({ exists: false, active: false })).toBe(false);
  });
});

describe("a condition list", () => {
  test("passes under All only when every condition passes", () => {
    expect(passes([isActive, exists], "All", active)).toBe(true);
    expect(passes([isActive, exists], "All", inactive)).toBe(false);
  });

  test("passes under Any when one condition passes", () => {
    expect(passes([isActive, exists], "Any", inactive)).toBe(true);
    expect(passes([isActive], "Any", inactive)).toBe(false);
  });

  test("lets the run through when it is empty, under both modes", () => {
    expect(passes([], "All", inactive)).toBe(true);
    expect(passes([], "Any", inactive)).toBe(true);
  });
});

describe("a run", () => {
  test("of the starting behaviour checks Is Active, then turns Self off", () => {
    expect(initialObject).toEqual(active);
    const steps = plan(initialBehaviour.instructions, initialObject);
    // Turning the host off cancels the run, even at its last instruction.
    expect(steps).toEqual([
      { kind: "run", id: "n1", object: active },
      { kind: "run", id: "n3", object: inactive },
      { kind: "stop", id: "n3", reason: "host-disabled" },
    ]);
  });

  test("stops at a Check Conditions whose conditions fail", () => {
    const instructions: InstructionNode[] = [
      { id: "i1", type: "Check Conditions", mode: "All", conditions: [isActive] },
      { id: "i2", type: "Log", message: "after" },
    ];
    expect(plan(instructions, inactive)).toEqual([
      { kind: "stop", id: "i1", reason: "conditions-failed" },
    ]);
  });

  test("runs the instructions in order, holding at a Wait", () => {
    const instructions: InstructionNode[] = [
      { id: "i1", type: "Log", message: "first" },
      { id: "i2", type: "Wait", seconds: 1.5 },
      { id: "i3", type: "Log", message: "second" },
    ];
    expect(plan(instructions, active)).toEqual([
      { kind: "log", id: "i1", message: "first" },
      { kind: "wait", id: "i2", seconds: 1.5 },
      { kind: "log", id: "i3", message: "second" },
    ]);
  });

  test("is cancelled when it turns Self off, so later instructions never run", () => {
    const instructions: InstructionNode[] = [
      { id: "i1", type: "Toggle Active" },
      { id: "i2", type: "Log", message: "never" },
    ];
    expect(plan(instructions, active)).toEqual([
      { kind: "run", id: "i1", object: inactive },
      { kind: "stop", id: "i1", reason: "host-disabled" },
    ]);
  });

  // Unity destroys an object at the end of the frame, so the run goes on until an instruction
  // waits for the next frame.
  test("goes on after Destroy until an instruction waits a frame, then is cancelled", () => {
    const destroyed = { exists: false, active: false };
    const instructions: InstructionNode[] = [
      { id: "i1", type: "Destroy" },
      { id: "i2", type: "Check Conditions", mode: "All", conditions: [isActive] },
      { id: "i3", type: "Log", message: "last words" },
      { id: "i4", type: "Log", message: "never" },
    ];
    expect(plan(instructions, active)).toEqual([
      { kind: "run", id: "i1", object: active },
      { kind: "run", id: "i2", object: active },
      { kind: "log", id: "i3", message: "last words" },
      { kind: "stop", id: "i3", reason: "host-destroyed", object: destroyed },
    ]);
  });

  test("destroys Self at the end of a run that ends right after Destroy", () => {
    expect(plan([{ id: "i1", type: "Destroy" }], active)).toEqual([
      { kind: "run", id: "i1", object: active },
      { kind: "run", id: "i1", object: { exists: false, active: false } },
    ]);
  });

  test("goes on when Set Active leaves Self on", () => {
    const instructions: InstructionNode[] = [
      { id: "i1", type: "Set Active", active: true },
      { id: "i2", type: "Log", message: "still here" },
    ];
    expect(plan(instructions, active)).toEqual([
      { kind: "run", id: "i1", object: active },
      { kind: "log", id: "i2", message: "still here" },
    ]);
  });
});

describe("editing the behaviour", () => {
  const start: Behaviour = initialBehaviour;

  test("adds an instruction at the end, with Atelier's default values", () => {
    const next = addInstruction(start, "Wait");
    expect(next.instructions.at(-1)).toMatchObject({ type: "Wait", seconds: 1 });
    expect(new Set(next.instructions.map((node) => node.id)).size).toBe(next.instructions.length);
  });

  test("adds a condition to a Check Conditions", () => {
    const check = start.instructions[0];
    const next = addCondition(start, check?.id ?? "", "Object Exists");
    const updated = next.instructions[0];
    expect(updated?.type === "Check Conditions" && updated.conditions.map((c) => c.type)).toEqual([
      "Is Active",
      "Object Exists",
    ]);
  });

  test("removes an instruction, or a condition inside one", () => {
    const check = start.instructions[0];
    const condition = check?.type === "Check Conditions" ? check.conditions[0] : undefined;
    const withoutCondition = removeNode(start, condition?.id ?? "");
    const updated = withoutCondition.instructions[0];
    expect(updated?.type === "Check Conditions" && updated.conditions).toEqual([]);
    const withoutCheck = removeNode(start, check?.id ?? "");
    expect(withoutCheck.instructions.map((node) => node.type)).toEqual(["Set Active"]);
  });

  test("changes a field of an instruction", () => {
    const set = start.instructions[1];
    const next = updateInstruction(start, set?.id ?? "", { active: true });
    expect(next.instructions[1]).toMatchObject({ type: "Set Active", active: true });
  });
});

describe("the node picker's catalog", () => {
  test("holds every node the demo runs, under its Atelier category", async () => {
    const { atelierCatalog } = await import("../src/content/atelier-nodes");
    for (const path of [
      "Flow/Check Conditions",
      "GameObject/Set Active",
      "Time/Wait",
      "Debug/Log",
    ]) {
      expect(atelierCatalog.instruction).toContain(path);
    }
    expect(atelierCatalog.condition).toContain("GameObject/Is Active");
    expect(atelierCatalog.condition).toContain("GameObject/Object Exists");
  });

  test("lists as conditions only Atelier's conditions, not its script property sources", async () => {
    const { atelierCatalog } = await import("../src/content/atelier-nodes");
    expect(atelierCatalog.condition).not.toContain("Scripts/Component");
    expect(atelierCatalog.condition).not.toContain("Scripts/On Object");
  });
});

describe("the node picker's search", () => {
  test("needs every word of the query in the title, in any order, and sorts the results", async () => {
    const { searchNodes } = await import("../src/components/atelier-demo/search");
    const paths = ["GameObject/Toggle Active", "GameObject/Set Active", "Time/Wait"];
    expect(searchNodes(paths, "active set").map((node) => node.title)).toEqual(["Set Active"]);
    expect(searchNodes(paths, "  ACTIVE ").map((node) => node.title)).toEqual([
      "Set Active",
      "Toggle Active",
    ]);
    expect(searchNodes(paths, "wait seconds")).toEqual([]);
  });
});
