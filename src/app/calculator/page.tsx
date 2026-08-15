import { Metadata } from "next";
import Link from "next/link";
import { Search,  
  DollarSign, 
  Briefcase, 
  Heart, 
  Calculator, 
  Atom, 
  Settings, 
  Cpu, 
  Leaf, 
  Clock, 
  Car, 
  HardHat, 
  GraduationCap 
 } from "lucide-react";
import SearchCalculators from "@/components/SearchCalculators";
import { inferIcon } from "@/components/shared/icon-map";
import { SubcategoryCard } from "@/components/shared/SubcategoryCard";
import { CATEGORY_SUMMARY } from "./summaryData";
import { toSlug } from "@/lib/utils/slug";
import { onlyLive } from "@/lib/tools/liveToolFilters";
import { calculatorRegistry } from "@/domains/calculator/registry";

// Live/discoverable count only — stub-tagged "live" entries are excluded.
const LIVE_CALC_COUNT = onlyLive(calculatorRegistry).length;

export const metadata: Metadata = {
  title: "All Calculators — Racira",
  description: `Browse ${LIVE_CALC_COUNT.toLocaleString()} free online calculators: finance, business, math, science, construction, and more. Professional-grade tools, no signup required.`,
  alternates: {
    canonical: "https://racira.com/calculator",
  },
};

const formatCategory = (cat: string) => {
  if (cat === 'EVERYDAY_LIFE') return 'Everyday Life';
  return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
};

const getCategoryIcon = (category: string) => {
  const upper = category.toUpperCase().replace(/ /g, '_');
  const icons: Record<string, any> = {
    "FINANCE": DollarSign,
    "BUSINESS": Briefcase,
    "HEALTH": Heart,
    "MATH": Calculator,
    "SCIENCE": Atom,
    "ENGINEERING": Settings,
    "TECHNOLOGY": Cpu,
    "ENVIRONMENT": Leaf,
    "EVERYDAY_LIFE": Clock,
    "TRANSPORTATION": Car,
    "CONSTRUCTION": HardHat,
    "EDUCATION": GraduationCap
  };
  return icons[upper] || Calculator;
};

export default function Home() {
  const categoryOrder = [
    "FINANCE", "BUSINESS", "HEALTH", "MATH", "SCIENCE", 
    "ENGINEERING", "TECHNOLOGY", "ENVIRONMENT", "EVERYDAY_LIFE", 
    "TRANSPORTATION", "CONSTRUCTION", "EDUCATION"
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            {LIVE_CALC_COUNT.toLocaleString()} Free Calculators —{" "}
            <span className="hero-gradient-text">Fast, Accurate & Free</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Professional-grade financial, business, health, math, science, and engineering calculators. No signup required.
          </p>
          <SearchCalculators />
        </div>
      </section>

      {/* Category Grid */}
      <div className="racira-page-container pb-4 sm:pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center calculator-category-grid">
          {categoryOrder.map(cat => {
            const summary = CATEGORY_SUMMARY.find(c => c.category === cat);
            const totalCount = summary ? summary.total : 0;
            const Icon = getCategoryIcon(cat);
            const catSlug = toSlug(formatCategory(cat));
            return (
              <Link
                key={cat}
                href={`/calculator/${catSlug}`}
                className="category-nav-card group calculator-category-card hover:cursor-pointer hover:shadow-md transition-all duration-200"
              >
                <div className="tool-card-icon h-14 w-14 mb-5 rounded-2xl flex items-center justify-center">
                  <Icon className="h-[30.6px] w-[30.6px] text-primary" />
                </div>
                <p className="text-[13.6px] font-bold text-foreground leading-tight text-center">{formatCategory(cat)}</p>
                <p className="text-[11.9px] text-muted-foreground mt-2">{totalCount} tools</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* All Categories with Tools */}
      <div className="racira-page-container pb-16">
        {categoryOrder.map((cat, idx) => {
          const summary = CATEGORY_SUMMARY.find(c => c.category === cat);
          if (!summary) return null;
          const catSlug = toSlug(formatCategory(cat));

          return (
            <section
              key={cat}
              className={idx > 0 ? "mt-14" : "mt-4"}
            >
              <h2 className="text-xl font-bold text-foreground mb-2">
                <Link href={`/calculator/${catSlug}`} className="cursor-pointer">
                  {formatCategory(cat)}
                </Link>
              </h2>
              <p className="text-sm text-muted-foreground mb-5">{summary.total} calculators</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summary.subcategories.map(sub => {
                  const subSlug = toSlug(sub.name);
                  const Icon = inferIcon(sub.name, subSlug);
                  return (
                    <SubcategoryCard
                      key={sub.name}
                      title={sub.name}
                      icon={Icon}
                      count={sub.count}
                      basePath={`/calculator/${subSlug}`}
                      label="calculators"
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* SEO Content */}
      <section className="racira-page-container pb-16 prose-finance">
        <h2>Why Use Racira Calculator?</h2>
        <p>
          Managing personal finances, tracking health metrics, solving math problems, or planning construction projects — 
          having the right tools at your fingertips makes all the difference.
          Racira Calculator provides a comprehensive suite of {LIVE_CALC_COUNT.toLocaleString()} free online calculators designed to help you make
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
