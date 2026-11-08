import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge only knows Tailwind's default scales. Without this, the type steps of the @theme
// block are read as text colors and dropped when merged with one, and the other custom tokens
// never override a conflicting class.
const twMerge = extendTailwindMerge({
  extend: {
    theme: { container: ["column"], aspect: ["picture", "tile"] },
    classGroups: {
      "font-size": [
        { text: ["display", "head", "title", "lead", "body", "small", "caption", "label"] },
      ],
      "font-weight": [{ font: ["heading"] }],
    },
  },
});

/** Joins class names; a later Tailwind class overrides a conflicting earlier one. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
