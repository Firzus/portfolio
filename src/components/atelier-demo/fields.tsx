import { useId, useState } from "react";
import type * as React from "react";
import { cn } from "../../lib/utils";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "../ui/select";

const control =
  "h-6 rounded-sm border border-editor-line bg-editor-control px-1.5 text-editor-ink hover:bg-editor-control-hover";

/** A label and its control on one row, the label column first, as in Unity's Inspector. */
function FieldRow({
  label,
  labelId,
  htmlFor,
  indent = false,
  children,
}: {
  label: string;
  labelId?: string;
  htmlFor?: string;
  indent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-5 items-center gap-2">
      <label id={labelId} htmlFor={htmlFor} className={indent ? "col-span-2 pl-3" : "col-span-2"}>
        {label}
      </label>
      <div className="col-span-3 min-w-0">{children}</div>
    </div>
  );
}

/** A field the demo does not let the visitor change, shown as Unity shows it. */
export function StaticField({
  label,
  value,
  indent,
}: {
  label: string;
  value: string;
  indent?: boolean;
}) {
  return (
    <FieldRow label={label} indent={indent}>
      <div className={cn(control, "flex items-center hover:bg-editor-control")}>{value}</div>
    </FieldRow>
  );
}

interface ChoiceFieldProps<Value extends string> {
  label: string;
  value: Value;
  items: { value: Value; label: string }[];
  onChange: (value: Value) => void;
  indent?: boolean;
}

export function ChoiceField<Value extends string>({
  label,
  value,
  items,
  onChange,
  indent,
}: ChoiceFieldProps<Value>) {
  const labelId = useId();
  return (
    <FieldRow label={label} labelId={labelId} indent={indent}>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => {
          if (next !== null) onChange(next as Value);
        }}
      >
        <SelectTrigger aria-labelledby={labelId} className={control} />
        <SelectPopup
          lang="en"
          className="border-editor-line bg-editor-card text-caption text-editor-ink"
        >
          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className="data-highlighted:bg-editor-control-hover"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </FieldRow>
  );
}

export function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  // The text being typed may be empty or partial ("", "0."); the value is committed on blur.
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    const next = Number.parseFloat(draft ?? "");
    if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
    setDraft(null);
  };
  return (
    <FieldRow label={label} htmlFor={id}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={draft ?? value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
        }}
        className={cn(control, "w-full bg-editor-field hover:bg-editor-field")}
      />
    </FieldRow>
  );
}

export function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <FieldRow label={label} htmlFor={id}>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={60}
        onChange={(event) => onChange(event.target.value)}
        className={cn(control, "w-full bg-editor-field hover:bg-editor-field")}
      />
    </FieldRow>
  );
}
