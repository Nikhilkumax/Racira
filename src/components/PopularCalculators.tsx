import Link from "next/link";
import { calculatorRegistry } from "@/data/calculatorRegistry";

const PopularCalculators = ({ exclude }: { exclude?: string }) => {
  // Show built calculators first, then fill with others
  const items = calculatorRegistry
    .filter(c => `/calculator/${c.slug}` !== exclude)
    .sort((a, b) => (b.isBuilt ? 1 : 0) - (a.isBuilt ? 1 : 0))
    .slice(0, 12);

  return (
    <section className="mt-20">
      <h2 className="text-2xl font-bold mb-6">Popular Calculators</h2>
      <div className="grid grid-cols-2 gap-6">
        {items.map((c) => (
          <Link key={c.slug} href={`/calculator/${c.slug}`} className="tool-card group">
            <div className="tool-card-icon bg-primary/10 rounded-xl h-11 w-11 flex items-center justify-center shrink-0">
              <c.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-[15px] leading-snug mb-1 flex items-center">
                {c.name}
                {!c.isBuilt && (
                  <span className="ml-1.5 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                )}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                {c.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularCalculators;
