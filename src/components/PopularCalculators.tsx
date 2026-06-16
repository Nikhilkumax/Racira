import Link from "next/link";
import { calculatorRegistry, getCategoryIcon } from "@/data/calculatorRegistry";

const PopularCalculators = ({ exclude }: { exclude?: string }) => {
  const items = calculatorRegistry
    .filter(c => `/calculator/${c.slug}` !== exclude)
    .sort((a, b) => (b.isBuilt ? 1 : 0) - (a.isBuilt ? 1 : 0))
    .slice(0, 12);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Calculators</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((c) => {
          const Icon = c.icon ?? getCategoryIcon(c.category);
          const catSlug = c.category ? c.category.toLowerCase().replace(/\s+/g, '-') : 'general';
          return (
          <Link
            key={c.slug}
            href={`/calculator/${catSlug}/${c.slug}`}
            className="h-[140px] flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 hover:border-primary/30 transition-all group"
          >
            <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-0.5">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base text-foreground mb-1 leading-snug flex items-center gap-1.5">
                {c.name}
                {!c.isBuilt && (
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
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
