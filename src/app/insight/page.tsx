import { CategorySearch } from "@/components/CategorySearch";
import { CATEGORIES } from "@/domains/insight/registry";
import Header from "@/components/Header";
import { CategorySection } from "@/domains/insight/components/CategorySection";


export default function Index() {
  const total = CATEGORIES.reduce((s, c) => s + c.tools.length, 0);
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <Header mode="category" categoryName="Insight" />
      <main className="flex-1 w-full">
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            10+ Free Data Tools —{" "}
            <span className="hero-gradient-text">CSV, JSON & Convert</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Clean, convert, and format data across CSV, JSON, and XML formats instantly. No signup required.
          </p>
          <CategorySearch categorySlug="insight" placeholder="Search 10+ data tools..." registry={(Array.isArray(CATEGORIES) ? CATEGORIES.flatMap((cat: any) => (cat.tools || []).map((t: any) => ({ name: (t as any).name, description: (t as any).description || '', slug: (t as any).slug, href: ((t as any).slug || '').startsWith('/') ? (t as any).slug : `/insight/tools/${(t as any).slug}`, category: (cat as any).name || (cat as any).title || (cat as any).label || '', isBuilt: (t as any).built !== false }))) : [])} />
        </div>
      </section>

        <section id="categories" className="racira-page-container pb-24 sm:px-6 w-full">
          {CATEGORIES.map((c) => (
            <CategorySection key={c.name} name={c.name} icon={c.icon} tools={c.tools} />
          ))}
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground w-full">
        © {new Date().getFullYear()} Racira Data &amp; Charts
      </footer>
    </div>
  );
}
