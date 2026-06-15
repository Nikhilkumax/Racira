import { Metadata } from "next";
import Link from "next/link";
import { DollarSign, Heart, Calculator, FlaskConical, Smile, HardHat, Trophy, Leaf, Cpu, GraduationCap, ArrowLeftRight, Car } from "lucide-react";
import { calculatorRegistry, getCategories, getCategoryIcon } from "@/data/calculatorRegistry";
import SearchCalculators from "@/components/SearchCalculators";

export const metadata: Metadata = {
  title: "All Calculators — Racira",
  description: "Browse 11,000+ free online calculators: finance, business, math, science, construction, and more. Professional-grade tools, no signup required.",
  alternates: {
    canonical: "https://racira.com/calculator",
  },
};

const formatCategory = (cat: string) => {
  if (cat === 'EVERYDAY_LIFE') return 'Everyday Life';
  return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
};

export default function Home() {
  const categories = getCategories();
  const categoryOrder = [
    "FINANCE", "BUSINESS", "HEALTH", "MATH", "SCIENCE", 
    "ENGINEERING", "TECHNOLOGY", "ENVIRONMENT", "EVERYDAY_LIFE", 
    "TRANSPORTATION", "CONSTRUCTION", "EDUCATION"
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            11,000+ Free Calculators —{" "}
            <span className="hero-gradient-text">Fast, Accurate & Free</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Professional-grade financial, business, health, math, science, and engineering calculators. No signup required.
          </p>
          <SearchCalculators />
        </div>
      </section>

      {/* Category Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-4 sm:pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center calculator-category-grid">
          {categoryOrder.map(cat => {
            const items = categories.get(cat) || [];
            const Icon = getCategoryIcon(cat);
            return (
              <Link
                key={cat}
                href={`#${cat.toLowerCase().replace(/_/g, "-")}`}
                className="category-nav-card group calculator-category-card"
              >
                <div className="tool-card-icon h-14 w-14 mb-5 rounded-2xl">
                  <Icon className="h-[30.6px] w-[30.6px] text-primary" />
                </div>
                <span className="text-[13.6px] font-bold text-foreground leading-tight text-center">{formatCategory(cat)}</span>
                <span className="text-[11.9px] text-muted-foreground mt-2">{items.length} tools</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* All Categories with Tools */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {categoryOrder.map((cat, idx) => {
          const items = categories.get(cat) || [];
          // Group by subcategory
          const subcategories = new Map<string, typeof items>();
          items.forEach(item => {
            const sub = item.subcategory || "General";
            const list = subcategories.get(sub) || [];
            list.push(item);
            subcategories.set(sub, list);
          });

          return (
            <section
              key={cat}
              id={cat.toLowerCase().replace(/_/g, "-")}
              className={idx > 0 ? "mt-14" : "mt-4"}
            >
              <h2 className="text-xl font-bold text-foreground mb-2">
                {formatCategory(cat)}
              </h2>
              <p className="text-sm text-muted-foreground mb-5">{items.length} calculators</p>

              {Array.from(subcategories.entries()).map(([sub, subItems]) => (
                <div key={sub} className="mb-6">
                  {subcategories.size > 1 && (
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{sub}</h3>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {subItems.map(t => (
                      <Link key={t.slug} href={`/calculator/${t.slug}`} className="tool-card group">
                        <div className="tool-card-icon">
                          {t.icon ? <t.icon className="h-5 w-5 text-primary" /> : <Calculator className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-foreground text-[15px] leading-snug mb-1">
                            {t.name}
                            {!t.isBuilt && <span className="ml-1.5 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Soon</span>}
                          </h4>
                          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{t.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>

      {/* SEO Content */}
      <section className="max-w-3xl mx-auto px-4 pb-16 prose-finance">
        <h2>Why Use Racira Calculator?</h2>
        <p>
          Managing personal finances, tracking health metrics, solving math problems, or planning construction projects — 
          having the right tools at your fingertips makes all the difference.
          Racira Calculator provides a comprehensive suite of 5000+ free online calculators designed to help you make
          informed decisions in every area of life.
        </p>
        <p>
          Our calculators use standard formulas trusted by professionals worldwide. Every
          calculation happens instantly in your browser — no sign-up, no data storage, and no hidden costs. We believe
          quality tools should be accessible to everyone.
        </p>

        <h2>Our Calculator Categories</h2>
        <p>
          <strong>Finance:</strong> Mortgages, loans, personal finance, investing, business and crypto.
        </p>
        <p>
          <strong>Health &amp; Fitness:</strong> BMI, BMR, TDEE, macros, and body metrics calculators.
        </p>
        <p>
          <strong>Math &amp; Science:</strong> Statistics, algebra, geometry, physics, and chemistry tools.
        </p>
        <p>
          <strong>Everyday Life &amp; Education:</strong> Time, dates, lifestyle conversions, and educational calculators.
        </p>
        <p>
          <strong>Construction &amp; Automobile:</strong> Concrete, building materials, auto loans, fuel, and mileage.
        </p>

        <h2>Trusted, Accurate, and Free</h2>
        <p>
          Racira Calculator is built for accuracy. Our formulas follow industry-standard methods. While our results are 
          estimates and should not replace professional advice, they provide a reliable starting point for your planning.
        </p>
      </section>
    </div>
  );
}
