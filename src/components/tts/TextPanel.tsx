"use client";

import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface TextPanelProps {
  value: string;
  onChange: (v: string) => void;
}

export function TextPanel({
  value,
  onChange,
}: TextPanelProps) {

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <h3 className="text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          Your text
        </h3>
        <button
          type="button"
          onClick={() => onChange("")}
          disabled={!value}
          aria-label="Clear text"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="relative flex-1 px-5 pb-3 pt-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter the text you want to convert to speech..."
          className={cn(
            "h-full min-h-[460px] w-full resize-none rounded-xl border-0 bg-transparent p-0 text-[15.5px] leading-relaxed shadow-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
          )}
        />
      </div>

    </div>
  );
}
