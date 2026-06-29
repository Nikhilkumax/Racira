"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidColor, toHex } from "@/lib/colors/color";

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
  useEffect(() => setText(value), [value]);

  function commit(v: string) {
    setText(v);
    if (isValidColor(v)) onChange(toHex(v));
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
