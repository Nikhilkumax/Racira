import Link from "next/link";
import Header from "@/components/Header";
import { categories } from "@/domains/business/registry";
import { SiteFooter } from "@/domains/business/components/SiteHeader";
import { Search, Wrench, Sparkles } from "lucide-react";
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
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 45+ business tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Business Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>

        <div className="racira-page-container pb-24 space-y-14">
          {categories.map((cat) => (
            <section key={cat.key}>
              <h2 className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase mb-5">
                {cat.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cat.tools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="group relative rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                  >
                    {t.status === "soon" && (
                      <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Soon
                      </span>
                    )}
                    <div className="h-10 w-10 rounded-lg bg-accent text-primary flex items-center justify-center mb-4">
                      {t.status === "available" ? (
                        <Sparkles className="h-5 w-5" />
                      ) : (
                        <Wrench className="h-5 w-5" />
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">{t.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {t.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
