import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calculator } from "lucide-react";
import { calculatorRegistry } from "@/data/calculatorRegistry";
import { CATEGORY_SUMMARY } from "../../summaryData";
import { toSlug } from "@/lib/utils/slug";

interface Props {
  params: { category: string; subcategory: string };
}

export async function generateStaticParams() {
  const params: { category: string; subcategory: string }[] = [];
  CATEGORY_SUMMARY.forEach(c => {
    const catSlug = toSlug(c.category);
    c.subcategories.forEach(sub => {
      params.push({ category: catSlug, subcategory: toSlug(sub.name) });
    });
  });
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const summary = CATEGORY_SUMMARY.find(c => toSlug(c.category) === params.category);
  if (!summary) return { title: "Not Found" };
  const sub = summary.subcategories.find(s => toSlug(s.name) === params.subcategory);
  if (!sub) return { title: "Not Found" };

  const title = `${sub.name} Calculators — Racira`;
  const description = `Browse ${sub.count} free online ${sub.name.toLowerCase()} calculators.`;
  const url = `https://racira.com/calculator/${params.category}/${params.subcategory}`;

  return {
    title,
    description,
    alternates: { canonical: url },
  };
}

export default function SubcategoryPage({ params }: Props) {
  const summary = CATEGORY_SUMMARY.find(c => toSlug(c.category) === params.category);
  if (!summary) notFound();
  
  const sub = summary.subcategories.find(s => toSlug(s.name) === params.subcategory);
  if (!sub) notFound();

  // Filter tools using calculatorRegistry
  const tools = calculatorRegistry.filter(t => {
    const tCatSlug = toSlug(t.category || "");
    const tSubSlug = toSlug(t.subcategory || "General");
    return tCatSlug === params.category && tSubSlug === params.subcategory;
  });

  const categoryName = summary.category;
  let formattedCategoryName = categoryName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  if (formattedCategoryName.toLowerCase() === "finance") {
    formattedCategoryName = "Financial";
  }

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
          <Link href={`/calculator#${toSlug(categoryName)}`} className="hover:text-foreground transition-colors">
            {formattedCategoryName}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <span className="text-foreground font-medium">{sub.name}</span>
        </nav>
      </div>

      <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            {sub.name} Calculators
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore {tools.length} professional-grade calculators for {sub.name.toLowerCase()}.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool: any) => {
            const slug = tool.slug || toSlug(tool.name);
            return (
              <Link
                key={slug}
                href={`/calculator/${params.category}/${params.subcategory}/${slug}`}
                className="tool-card group hover:cursor-pointer hover:shadow-md transition-all duration-200 flex items-start p-4 border border-border rounded-xl bg-card"
              >
                <div className="tool-card-icon mr-4 mt-1 bg-primary/10 p-2 rounded-lg">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-[15px] leading-snug mb-1">
                    {tool.name}
                  </h4>
                  <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                    {tool.description || "Free online calculator."}
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
