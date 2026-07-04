import Link from "next/link";
import * as Icons from "lucide-react";
import type { Tool } from "@/domains/insight/registry";
import { FUNCTIONAL_SLUGS } from "@/domains/insight/registry";

type IconName = keyof typeof Icons;

export function CategorySection({
  name,
  icon,
  tools,
}: {
  name: string;
  icon: string;
  tools: Tool[];
}) {
  const Icon = (Icons[icon as IconName] as React.ComponentType<{ className?: string }>) ?? Icons.BarChart3;
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {name}
        </h2>
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {tools.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((t) => (
          <ToolCard key={t.slug} tool={t} icon={icon} />
        ))}
      </div>
    </section>
  );
}

function ToolCard({ tool, icon }: { tool: Tool; icon: string }) {
  const Icon = (Icons[icon as IconName] as React.ComponentType<{ className?: string }>) ?? Icons.BarChart3;
  const isLive = FUNCTIONAL_SLUGS.has(tool.slug);
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="text-sm font-semibold text-foreground">{tool.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{tool.desc}</p>
      {!isLive && (
        <span className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Soon
        </span>
      )}
    </Link>
  );
}
