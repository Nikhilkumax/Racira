import { Search } from "lucide-react";
﻿import { CATEGORIES } from "@/domains/insight/registry";
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
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 10+ data tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Data Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
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
