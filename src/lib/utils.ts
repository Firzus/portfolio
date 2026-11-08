import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The type scale of the @theme block is not in tailwind-merge's default scale; without this its
// steps are read as text colors and dropped when merged with one.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "head", "lead", "body", "small", "caption", "label"] }],
    },
  },
});

/** Joins class names; a later Tailwind class overrides a conflicting earlier one. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
