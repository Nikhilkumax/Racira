import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { categories } from "@/data/tools";
import { cn } from "@/lib/utils";

const Categories = () => {
  return (
    <section id="categories" className="container py-14 md:py-20">
      <div className="mb-10 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          The Suite
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
          Multiple tool ecosystems. One platform.
        </h2>
        <p className="mt-4 text-sm text-muted-foreground md:text-base leading-relaxed">
          Every category is an expandable product surface — built on the same
          design system, with new ecosystems added over time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const active = cat.status === "active";

          const content = (
            <div
              className={cn(
                "group relative flex flex-col h-full overflow-hidden rounded-xl border border-border bg-card p-7 shadow-soft transition-all duration-200",
                active && "hover:-translate-y-1 hover:border-primary hover:shadow-glow",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="tool-card-icon h-12 w-12">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                    active
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {active ? "Live" : "Soon"}
                </span>
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {cat.tagline}
                </p>
                <h3 className="mt-1.5 text-2xl font-bold tracking-tight">{cat.title}</h3>
                <p className="mt-2.5 max-w-md text-sm text-muted-foreground leading-relaxed">
                  {cat.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {cat.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {active ? "Explore Category" : "Coming soon"}
                  <ArrowUpRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      active && "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                    )}
                  />
                </div>
              </div>
            </div>
          );

          if (active) {
            return (
              <Link key={cat.slug} href={`/${cat.slug}`} className="block h-full">
                {content}
              </Link>
            );
          }

          return <div key={cat.slug}>{content}</div>;
        })}

        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-dashed border-border bg-card/50 p-7 shadow-soft">
          <div className="flex items-start justify-between">
            <div className="tool-card-icon h-12 w-12">
              <Plus className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              In progress
            </span>
          </div>
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              And more
            </p>
            <h3 className="mt-1.5 text-2xl font-bold tracking-tight">New categories</h3>
            <p className="mt-2.5 max-w-md text-sm text-muted-foreground leading-relaxed">
              The platform is designed to keep growing — new ecosystems are added as the
              toolkit expands.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
