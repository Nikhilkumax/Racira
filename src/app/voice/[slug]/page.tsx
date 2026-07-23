import Link from "next/link";
import { notFound } from "next/navigation";
import { Construction, ArrowLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { CATEGORIES } from "@/domains/voice/registry";
import { Metadata } from "next";
import { toSlug } from "@/lib/utils/slug";
import { SubcategoryCard } from "@/components/shared/SubcategoryCard";
import { inferIcon } from "@/components/shared/icon-map";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// ==========================================
// METADATA
// ==========================================
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // 1. Check Category
  const category = CATEGORIES.find(c => toSlug(c.name) === slug);
  if (category) {
    return {
      title: `${category.name} — Racira Voice`,
      description: category.description,
      alternates: {
        canonical: `/voice/${slug}`,
      },
    };
  }

  // 2. Check Tool
  let tool: any = null;
  for (const cat of CATEGORIES) {
    const t = cat.tools.find((tool: any) => tool.slug === slug);
    if (t) {
      tool = t;
      break;
    }
  }
  
  if (tool) {
    return {
      title: `${tool.name} — Free AI Voice Tool`,
      description: tool.description,
      alternates: {
        canonical: `/voice/${tool.slug}`,
      },
    };
  }

  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  
  for (const cat of CATEGORIES) {
    params.push({ slug: toSlug(cat.name) });
    for (const tool of cat.tools) {
      params.push({ slug: tool.slug });
    }
  }

  return params;
}

// ==========================================
// VIEWS
// ==========================================
function CategoryView({ category }: { category: typeof CATEGORIES[0] }) {
  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Voice" />
      
      <div className="racira-page-container pt-8 pb-0">
        <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href="/voice" className="hover:text-foreground transition-colors">Voice Tools</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>
      </div>

      <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            {category.name}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            {category.description}
          </p>
        </div>
      </section>

      <div className="racira-page-container pb-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {category.tools.map((tool: any) => {
            const Icon = tool.icon || inferIcon(tool.name, tool.slug);
            return (
              <SubcategoryCard
                key={tool.slug}
                title={tool.name}
                icon={Icon}
                count={0}
                basePath={`/voice/${tool.slug}`}
                label="tool"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ToolView({ tool, category }: { tool: any, category: typeof CATEGORIES[0] }) {
  const categorySlug = toSlug(category.name);

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Voice" />

      <div className="racira-page-container pt-8">
        <nav aria-label="breadcrumb" className="hidden md:flex items-center flex-wrap text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href="/voice" className="hover:text-foreground transition-colors">Voice Tools</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href={`/voice/${categorySlug}`} className="hover:text-foreground transition-colors">
            {category.name}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <span className="text-foreground font-medium">{tool.name}</span>
        </nav>

        <nav aria-label="breadcrumb" className="md:hidden flex items-center mb-6">
          <Link href={`/voice/${categorySlug}`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            <span aria-hidden="true">←</span>{category.name}
          </Link>
        </nav>
      </div>

      {tool.status === "live" ? (
        <div className="racira-page-container py-16 text-center text-muted-foreground">
          Voice Tool UI (Live)
        </div>
      ) : (
        <ComingSoon name={tool.name} description={tool.description} />
      )}
    </div>
  );
}

// ==========================================
// POLYMORPHIC ENTRY POINT
// ==========================================
export default async function PolymorphicPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Is it a category?
  const category = CATEGORIES.find(c => toSlug(c.name) === slug);
  if (category) {
    return <CategoryView category={category} />;
  }

  // 2. Is it a tool?
  for (const cat of CATEGORIES) {
    const t = cat.tools.find((tool: any) => tool.slug === slug);
    if (t) {
      return <ToolView tool={t} category={cat} />;
    }
  }

  // 3. Not found
  notFound();
}

function ComingSoon({ name, description }: { name: string; description: string }) {
  return (
    <div className="racira-page-container py-16 sm:py-24 max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/50 text-muted-foreground mb-6">
        <Construction className="h-8 w-8" />
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        {name}
      </h1>
      
      <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
        {description}
      </p>
      
      <p className="mt-8 max-w-md text-sm text-muted-foreground mx-auto">
        We're polishing this one. In the meantime, try our{" "}
        <Link
          href="/voice"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          AI Voice Tools
        </Link>
        .
      </p>
    </div>
  );
}
