import { cn } from "@/lib/utils";

export function TTSLogo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-brand"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-foreground" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="4" y1="12" x2="4" y2="12" />
          <line x1="8" y1="8" x2="8" y2="16" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="16" y1="8" x2="16" y2="16" />
          <line x1="20" y1="11" x2="20" y2="13" />
        </svg>
      </span>
      {withWordmark && (
        <span className="font-display text-[17px] font-bold tracking-tight">
          Racira <span className="text-muted-foreground font-semibold">TTS</span>
        </span>
      )}
    </div>
  );
}
