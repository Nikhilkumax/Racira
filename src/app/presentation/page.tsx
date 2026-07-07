import { Search } from "lucide-react";
import { Metadata } from "next";
import Header from "@/components/Header";

import { CategorySection } from "@/components/presentation/CategorySection";
import { categories, totalToolCount } from "@/data/presentation/tools";

export const metadata: Metadata = {
  title: "Racira Presentation Tools — Free Browser Tools for Slides",
  description: "Build, design, and share decks with free presentation tools right in your browser. No signup required.",
  openGraph: {
    title: "Racira Presentation Tools",
    description: "Free browser-based tools to build, design, and share presentations.",
  },
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Presentation" />
      <main>
        <section className="px-6 pb-12 pt-20 sm:pt-28">
                <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            190+ Free Presentation Tools —{" "}
            <span className="hero-gradient-text">Slides, Timers & Prompters</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Everything you need for presentations, from slide timers to teleprompters. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 190+ presentation tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Presentation Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>
        </section>

        <div className="racira-page-container pb-24">
          {categories.map((c) => (
            <CategorySection key={c.slug} category={c} />
          ))}
        </div>
      </main>
      <footer className="border-t border-border py-8">
        <div className="racira-page-container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Racira Presentation Tools
        </div>
      </footer>
    </div>
  );
}
