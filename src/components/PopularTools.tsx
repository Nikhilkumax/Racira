import Link from "next/link";
import { ArrowUpRight, Calculator } from "lucide-react";
import { popularTools } from "@/data/tools";

const PopularTools = () => {
  return (
    <section className="container py-14 md:py-20">
      <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Popular
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            Most-used tools this month.
          </h2>
        </div>
        <Link
          href="/calculator"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80"
        >
          View all calculators <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {popularTools.map((tool) => (
          <Link key={tool.slug} href={`/${tool.category}/${tool.slug}`} className="tool-card group">
            <div className="tool-card-icon">
              <Calculator className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold leading-snug">{tool.name}</h3>
              <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                {tool.description}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularTools;
