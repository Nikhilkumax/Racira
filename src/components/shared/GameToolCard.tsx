import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface GameToolCardProps {
  title: string;
  slug: string;
  subcategory: string;
  icon: LucideIcon;
}

// Server component — no "use client" — safe to receive LucideIcon as prop from RSC.
export function GameToolCard({ title, slug, subcategory, icon: Icon }: GameToolCardProps) {
  return (
    <div className="tool-card group flex flex-col h-full p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="tool-card-icon h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{title}</h3>
        </div>
      </div>
      <div className="mt-auto pt-2 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          Coming Soon
        </span>
        <span className="text-[11px] text-muted-foreground truncate ml-2">{subcategory}</span>
      </div>
    </div>
  );
}
