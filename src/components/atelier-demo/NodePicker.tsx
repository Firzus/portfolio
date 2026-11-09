import { Folder, NavArrowLeft, NavArrowRight, Plus } from "iconoir-react";
import { useState } from "react";
import { atelierCatalog } from "../../content/atelier-nodes";
import { cn } from "../../lib/utils";
import { m } from "../../paraglide/messages.js";
import { getLocale } from "../../paraglide/runtime.js";
import { Popover, PopoverPopup, PopoverTrigger } from "../ui/popover";
import { editorLabels } from "./labels";
import { catalogNode, searchNodes } from "./search";

interface NodePickerProps<Type extends string> {
  kind: "instruction" | "condition";
  /** The nodes the demo can run; every other node of the catalog is listed but cannot be added. */
  runnable: readonly Type[];
  onPick: (type: Type) => void;
}

/** Atelier's node picker: folders by category, and a search over every node of the catalog. */
export function NodePicker<Type extends string>({ kind, runnable, onPick }: NodePickerProps<Type>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState<string[]>([]);
  const label = kind === "instruction" ? editorLabels.addInstruction : editorLabels.addCondition;
  const heading = kind === "instruction" ? editorLabels.instruction : editorLabels.condition;

  const entries = atelierCatalog[kind].map(catalogNode);
  const search = query.trim().length > 0;
  const prefix = folder.length > 0 ? `${folder.join("/")}/` : "";
  const inFolder = entries.filter((entry) => entry.path.startsWith(prefix));
  const subfolders = [
    ...new Set(
      inFolder
        .map((entry) => entry.path.slice(prefix.length).split("/"))
        .filter((segments) => segments.length > 1)
        .map((segments) => segments[0] ?? ""),
    ),
  ];
  const nodes = search
    ? searchNodes(atelierCatalog[kind], query)
    : inFolder.filter((entry) => !entry.path.slice(prefix.length).includes("/"));

  function reset(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
      setFolder([]);
    }
  }

  const row =
    "flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left hover:bg-editor-control-hover";

  return (
    <Popover open={open} onOpenChange={reset}>
      <PopoverTrigger className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-editor-muted/50 py-1.5 text-editor-ink hover:bg-editor-card-hover">
        <Plus aria-hidden="true" className="size-3.5" />
        {label}
      </PopoverTrigger>
      <PopoverPopup
        lang="en"
        aria-label={label}
        className="flex w-72 flex-col gap-1 border-editor-line bg-editor-card p-1.5 text-caption text-editor-ink"
      >
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={editorLabels.searchPlaceholder}
          aria-label={m.demo_picker_search()}
          lang={getLocale()}
          className="h-7 rounded-sm bg-editor-field px-2 text-editor-ink placeholder:text-editor-muted"
        />
        <div className="flex h-7 items-center justify-center gap-1">
          {folder.length > 0 && !search && (
            <button
              type="button"
              onClick={() => setFolder(folder.slice(0, -1))}
              aria-label={m.demo_picker_back()}
              lang={getLocale()}
              className="mr-auto grid size-6 place-items-center rounded-sm hover:bg-editor-control-hover"
            >
              <NavArrowLeft aria-hidden="true" className="size-3.5" />
            </button>
          )}
          <p className="font-semibold">{search ? heading : (folder.at(-1) ?? heading)}</p>
          {folder.length > 0 && !search && <span aria-hidden="true" className="ml-auto size-6" />}
        </div>
        <ul className="max-h-64 overflow-y-auto">
          {!search &&
            subfolders.map((name) => (
              <li key={name}>
                <button type="button" onClick={() => setFolder([...folder, name])} className={row}>
                  <Folder aria-hidden="true" className="size-3.5 text-editor-muted" />
                  <span className="flex-1">{name}</span>
                  <NavArrowRight aria-hidden="true" className="size-3.5 text-editor-muted" />
                </button>
              </li>
            ))}
          {nodes.map((entry) => {
            const type = runnable.find((candidate) => candidate === entry.title);
            return (
              <li key={entry.path}>
                <button
                  type="button"
                  aria-disabled={type ? undefined : true}
                  onClick={() => {
                    if (!type) return;
                    onPick(type);
                    reset(false);
                  }}
                  className={cn(row, !type && "text-editor-muted hover:bg-transparent")}
                >
                  <span className="flex-1">
                    {entry.title}
                    {search && (
                      <span className="block text-label tracking-normal text-editor-muted">
                        {entry.path}
                      </span>
                    )}
                  </span>
                  {!type && (
                    <span lang={getLocale()} className="text-label tracking-normal">
                      {m.demo_picker_unavailable()}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {search && nodes.length === 0 && (
            <li lang={getLocale()} className="px-2 py-1 text-editor-muted">
              {m.demo_picker_empty()}
            </li>
          )}
        </ul>
      </PopoverPopup>
    </Popover>
  );
}
