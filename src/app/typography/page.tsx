import Link from "next/link";
import { categories } from "@/data/typography/tools";
import { SiteHeader, SiteFooter } from "@/components/typography/site-header";
import { ArrowRight, Sparkles } from "lucide-react";
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
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/40 px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            {total}+ free typography tools
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
            All Typography Tools You Need —{" "}
            <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
              Fast, Simple &amp; Free
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Preview, pair, scale, convert and inspect typography. {total}+ free typography tools in your browser. No signup required.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/tools/font-previewer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try Font Previewer <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#tools"
              className="inline-flex items-center rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Browse all tools
            </a>
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
                    className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-[0_8px_30px_-12px_oklch(0.42_0.21_277/0.25)]"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="grid h-10 w-10 place-items-center rounded-lg text-primary"
                        style={{ backgroundColor: "oklch(0.96 0.03 277)" }}
                      >
                        <span className="font-serif text-xl font-bold leading-none">Aa</span>
                      </div>
                      {tool.built ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          Live
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-snug">{tool.desc}</p>
                    </div>
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
