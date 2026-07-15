"use client";

import { CategorySearch } from "@/components/CategorySearch";
import { categories, SEARCH_REGISTRY } from "@/domains/animator/registry";
import { CategorySection } from "@/components/shared/CategorySection";
import Header from "@/components/Header";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Animator" />
      <main>
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              116 Free Animation Tools —{" "}
              <span className="hero-gradient-text">CSS, SVG & Keyframes</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Generate CSS animations, SVG paths, and keyframe sequences for your web projects. No signup required.
            </p>
            <CategorySearch categorySlug="animator" placeholder="Search 116 animation tools..." registry={SEARCH_REGISTRY} />
          </div>
        </section>

        <div className="racira-page-container space-y-14 pb-16">
          {categories.map((cat) => (
            <CategorySection
              key={cat.name}
              section={{
                title: cat.name,
                tools: cat.tools
              }}
              basePath="/animator/tool"
            />
          ))}
        </div>
      </main>
      <footer className="border-t border-border py-8 mt-16">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Racira Animator — Free browser tools for animation workflows.
        </div>
      </footer>
    </div>
  );
}
