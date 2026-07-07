import Link from "next/link";
import Header from "@/components/Header";
import { categories } from "@/data/typography/tools";
import { SiteFooter } from "@/components/typography/site-header";
import { ArrowRight, Sparkles, Search } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racira Typography — All Typography Tools You Need",
  description: "98+ free typography tools: font previewer, pairing, type scales, glyphs, CSS typography and more.",
  openGraph: {
    title: "Racira Typography",
    description: "98+ free typography tools in your browser. No signup.",
  },
};

export default function Index() {
  const total = categories.reduce((n, c) => n + c.tools.length, 0);
  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Typography" />
      <main>
                <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              20+ Free Typography Tools —{" "}
              <span className="hero-gradient-text">Fonts, Scales & Pairings</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Find perfect font pairings, generate modular scales, and preview typography instantly. No signup required.
            </p>
            <div className="relative w-full max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search 20+ typography tools..."
                  className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                  aria-label="Search Typography Tools"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </section>

        <section id="tools" className="mx-auto max-w-6xl px-6 pb-16 space-y-14">
          {categories.map((cat) => (
            <div key={cat.name}>
              <div className="mb-5 flex items-baseline justify-between">
                <h2 className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {cat.name}
                </h2>
                <span className="text-xs text-muted-foreground">{cat.tools.length} tools</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cat.tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="tool-card group hover:-translate-y-[3px] hover:border-primary/40 hover:shadow-[0_8px_24px_hsl(var(--ring)/0.1)]"
                  >
                    {!tool.built && (
                      <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Soon
                      </span>
                    )}
                    <div
                      className="mb-4 grid h-10 w-10 place-items-center rounded-xl text-primary"
                      style={{ backgroundColor: "oklch(0.96 0.03 277)" }}
                    >
                      <span className="font-serif text-xl font-bold leading-none">Aa</span>
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
