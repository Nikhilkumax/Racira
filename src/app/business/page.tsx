import Link from "next/link";
import Header from "@/components/Header";
import { categories, SEARCH_REGISTRY } from "@/domains/business/registry";
import { SiteFooter } from "@/domains/business/components/SiteHeader";
import BusinessClientGrid from "@/domains/business/components/ClientGrid";
import { CategorySearch } from "@/components/CategorySearch";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racira Business Tools — 53 Free Tools for Operators & Founders",
  description:
    "53 free business tools for HR, strategy, sales, meetings, operations, and startups. SWOT, lean canvas, roadmaps, planners — fast, simple, no signup.",
  openGraph: {
    title: "Racira Business Tools",
    description:
      "53 free business tools across HR, strategy, sales, meetings, and startups.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="category" categoryName="Business" />
      <main className="flex-1">
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            45+ Free Business Tools —{" "}
            <span className="hero-gradient-text">ROI, Margin & Growth</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Calculate ROI, profit margins, and track growth metrics to run your business effectively. No signup required.
          </p>
          <CategorySearch categorySlug="business" placeholder="Search 45+ business tools..." registry={SEARCH_REGISTRY} />
        </div>
      </section>

      <BusinessClientGrid />
    </main>
    <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
      Racira Business — Free Business Tools
    </footer>
  </div>
  );
}
