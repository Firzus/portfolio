import type { InputKey } from "./behaviour";

/**
 * Words of Atelier's own Inspector, which is in English only. The demo reproduces that interface,
 * so they stay in English in every locale, inside an element marked `lang="en"`.
 */
export const editorLabels = {
  inspector: "Inspector",
  behaviour: "Behaviour",
  whenHeading: "WHEN",
  thenHeading: "THEN",
  ifHeading: "IF",
  button: "Button",
  keyboardKey: "Keyboard Key",
  key: "Key",
  on: "On",
  target: "Target",
  self: "Self",
  active: "Active",
  seconds: "Seconds",
  time: "Time",
  game: "Game",
  message: "Message",
  ignore: "Ignore",
  addCondition: "Add Condition",
  addInstruction: "Add Instruction",
  instruction: "Instruction",
  condition: "Condition",
  searchPlaceholder: "Search...",
  onInputButton: "On Input Button",
  object: "Object",
  targetValue: "Target",
  pressed: "Pressed",
  released: "Released",
  all: "All",
  any: "Any",
  trueValue: "True",
  falseValue: "False",
};

export const keyLabels: Record<InputKey, string> = { E: "E", F: "F", Q: "Q", Space: "Space" };

/**
 * The value of `KeyboardEvent.code` for each key the demo offers: the physical key, as Unity's
 * Keyboard Key reads it, whatever the layout, Shift or Caps Lock.
 */
export const keyCodes: Record<InputKey, string> = {
  E: "KeyE",
  F: "KeyF",
  Q: "KeyQ",
  Space: "Space",
};
