import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

export function Swatch({
  color,
  label,
  size = "md",
  className,
}: {
  color: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const h = size === "sm" ? "h-12" : size === "lg" ? "h-32" : "h-20";
  return (
    <div className={cn("rounded-lg overflow-hidden border border-border bg-card", className)}>
      <div className={cn("w-full", h)} style={{ backgroundColor: color }} />
      <div className="flex items-center justify-between px-3 py-2">
        <div>
          {label && <p className="text-xs text-muted-foreground">{label}</p>}
          <p className="font-mono text-sm uppercase">{color}</p>
        </div>
        <CopyButton value={color} />
      </div>
    </div>
  );
}