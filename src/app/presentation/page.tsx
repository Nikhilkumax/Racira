import { CategorySearch } from "@/components/CategorySearch";
import { Metadata } from "next";
import Header from "@/components/Header";

import { CategorySection } from "@/components/presentation/CategorySection";
import { categories, totalToolCount, SEARCH_REGISTRY } from "@/data/presentation/tools";

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
        <section className="racira-page-container pb-12 pt-20 sm:pt-28">
                <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            175 Free Presentation Tools —{" "}
            <span className="hero-gradient-text">Slides, Timers & Prompters</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Everything you need for presentations, from slide timers to teleprompters. No signup required.
          </p>
          <CategorySearch categorySlug="presentation" placeholder="Search 175 presentation tools..." registry={SEARCH_REGISTRY} />
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
