import Link from "next/link";
import { calculatorRegistry, getCategoryIcon } from "@/domains/calculator/registry";
import { isLiveTool } from "@/lib/tools/liveToolFilters";

const PopularCalculators = ({ exclude }: { exclude?: string }) => {
  const items = calculatorRegistry
    .filter(c => `/calculator/${c.slug}` !== exclude)
    .filter((c) => isLiveTool(c, "calculator"))
    .slice(0, 8);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Calculators</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((c) => {
          const Icon = c.icon ?? getCategoryIcon(c.category);
          const catSlug = c.category ? c.category.toLowerCase().replace(/\s+/g, '-') : 'general';
          return (
          <Link
            key={c.slug}
            href={`/calculator/${c.slug}`}
            className="tool-card group"
          >
            {c.status !== "live" && (
              <span className="tool-card-badge">Soon</span>
            )}
            <div className="tool-card-icon">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground text-[15px] leading-snug mb-1">
                {c.name}
              </h4>
              <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                {c.description}
              </p>
            </div>
          </Link>
          );
        })}

      </div>
    </section>
  );
};

export default PopularCalculators;
