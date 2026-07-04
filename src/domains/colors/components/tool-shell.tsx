import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import type { ToolDef } from "@/domains/colors/registry/types";
import { CATEGORY_META } from "@/domains/colors/registry/types";

export function ToolShell({ tool, children }: { tool: ToolDef; children: ReactNode }) {
  const Icon = tool.icon;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All tools
      </Link>
      <div className="mt-6 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {CATEGORY_META[tool.category].label}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{tool.title}</h1>
          <p className="mt-1 text-muted-foreground">{tool.description}</p>
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}