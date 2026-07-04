"use client";

import { cn } from "@/lib/utils";

interface TonePresetsProps {
  value: string;
  onChange: (id: string) => void;
}

const PRESETS = [
  { id: "voiceover", label: "Voiceover" },
  { id: "podcast",   label: "Podcast Host" },
  { id: "narrate",   label: "Narrate a story" },
  { id: "news",      label: "News Anchor" },
  { id: "meditation",label: "Meditation Guide" },
  { id: "support",   label: "Customer Support" },
  { id: "kids",      label: "Kids Story" },
  { id: "none",      label: "None" },
];

export function TonePresets({ value, onChange }: TonePresetsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((p) => {
        const active = p.id === value;
        const isNone = p.id === "none";

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            aria-pressed={active}
            className={cn(
              "h-10 flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? isNone
                  ? "border-border bg-muted text-foreground shadow-soft"
                  : "border-brand bg-brand text-brand-foreground shadow-soft"
                : "border-border-subtle bg-surface text-foreground hover:bg-surface-muted",
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
