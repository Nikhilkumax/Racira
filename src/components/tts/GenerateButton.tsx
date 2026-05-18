"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  state: "generate" | "update" | "loading";
  disabled?: boolean;
  onClick: () => void;
}

export function GenerateButton({ state, disabled, onClick }: GenerateButtonProps) {
  const label = state === "loading" ? "Generating..." : state === "update" ? "Update Audio" : "Generate Audio";
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || state === "loading"}
      className={cn(
        "h-14 w-full gap-2 rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-brand transition-all",
        "hover:bg-brand/90 hover:shadow-elevated",
        "disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
      )}
    >
      {state === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
      {label}
    </Button>
  );
}
