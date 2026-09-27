"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isCompleteHex, isValidColor, toHex } from "@/domains/colors/lib/color";

export function ColorField({
  value,
  onChange,
  label = "Color",
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  id?: string;
}) {
  const [text, setText] = useState(value);
  // The draft text is only replaced when the colour changed from elsewhere;
  // if the current text already decodes to this colour it is what this field
  // just committed, so the raw typing stays put.
  useEffect(() => {
    setText((prev) => (isValidColor(prev) && toHex(prev) === value ? prev : value));
  }, [value]);

  // Keep the raw draft in the field and commit only a complete 3- or 6-digit
  // hex. culori also parses partial forms such as "#9999", so committing on
  // every keystroke would normalize a half-typed value into a full colour and
  // push it back over the text mid-edit.
  function commit(v: string) {
    setText(v);
    if (isCompleteHex(v)) onChange(toHex(v));
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={toHex(value)}
          onChange={(e) => { setText(e.target.value); onChange(e.target.value); }}
          className="h-10 w-12 cursor-pointer rounded-md border border-input bg-background"
        />
        <Input
          id={id}
          value={text}
          onChange={(e) => commit(e.target.value)}
          className="font-mono uppercase"
        />
      </div>
    </div>
  );
}
