import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
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
  GraduationCap,
  ChevronRight
} from "lucide-react";
import { CATEGORY_SUMMARY } from "../summaryData";
import { toSlug } from "@/lib/utils/slug";

const formatCategory = (cat: string) => {
  if (cat === 'EVERYDAY_LIFE') return 'Everyday Life';
  let formatted = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  if (formatted.toLowerCase() === 'finance') formatted = 'Financial';
  return formatted;
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

interface Props {
  params: { category: string };
}

export async function generateStaticParams() {
  return CATEGORY_SUMMARY.map(c => ({
    category: toSlug(formatCategory(c.category)),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const summary = CATEGORY_SUMMARY.find(c => toSlug(formatCategory(c.category)) === params.category);
  if (!summary) return { title: "Category Not Found" };

  const catName = formatCategory(summary.category);
  const title = `${catName} Calculators — Racira`;
  const description = `Browse ${summary.total} free online ${catName.toLowerCase()} calculators.`;
  const url = `https://racira.com/calculator/${params.category}`;

  return {
    title,
    description,
    alternates: { canonical: url },
  };
}

export default function CategoryPage({ params }: Props) {
  const summary = CATEGORY_SUMMARY.find(c => toSlug(formatCategory(c.category)) === params.category);
  
  if (!summary) {
    notFound();
  }

  const catName = formatCategory(summary.category);
  const Icon = getCategoryIcon(summary.category);
  const catSlug = toSlug(catName);

  return (
    <div className="flex flex-col">
      <div className="container-page pt-3 pb-0">
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href="/calculator" className="hover:text-foreground transition-colors">
            Calculators
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <span className="text-foreground font-medium">{catName}</span>
        </nav>
      </div>

      <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            {catName} Calculators
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore {summary.total} professional-grade {catName.toLowerCase()} calculators and tools.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.subcategories.map(sub => {
            const subSlug = toSlug(sub.name);
            return (
              <Link
                key={sub.name}
                href={`/calculator/${catSlug}/${subSlug}`}
                className="tool-card group hover:cursor-pointer hover:shadow-md transition-all duration-200"
              >
                <div className="tool-card-icon">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-[15px] leading-snug mb-1">
                    {sub.name}
                  </h4>
                  <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                    {sub.count} calculators
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
