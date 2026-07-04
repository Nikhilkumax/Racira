"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { PIPER_VOICES } from "@/domains/voice/lib/piperVoices";

interface LanguageSelectProps {
  value: string;
  onChange: (v: string) => void;
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const languages = useMemo(() => {
    const map = new Map<string, { code: string; label: string }>();
    PIPER_VOICES.forEach(v => {
      if (!map.has(v.language)) {
        map.set(v.language, { code: v.language, label: v.languageLabel });
      }
    });
    
    return [
      { code: "auto", label: "Auto Detect" },
      ...Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
    ];
  }, []);

  const selected = languages.find((l) => l.code === value) || languages[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl h-14 border border-border bg-card hover:bg-accent/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center">
            {selected.code === "auto" ? (
              <Globe className="w-5 h-5 text-muted-foreground" />
            ) : (
              <span className="text-base font-bold text-muted-foreground/80">
                {selected.code.split("-")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-left leading-tight">
            <div className="text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Language
            </div>
            <div className="text-base font-medium">{selected.label}</div>
          </div>
        </div>
        <ChevronDown
          className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-popover shadow-xl max-h-[300px] overflow-y-auto p-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onChange(lang.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-accent/10",
                  value === lang.code && "bg-accent/20",
                )}
              >
                <div className="w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0">
                  {lang.code === "auto" ? (
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <span className="text-[11px] font-bold text-muted-foreground/80">
                      {lang.code.split("-")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="font-medium text-sm">{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
