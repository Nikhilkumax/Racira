import Link from "next/link";
import Header from "@/components/Header";
import { ArrowRight, Search } from "lucide-react";

export const metadata = {
  title: "Racira Image — 80+ Free Image Tools in Your Browser",
  description: "Resize, compress, crop, convert, and enhance images. 80+ free image tools that run entirely in your browser. No signup, no upload limits.",
  openGraph: {
    title: "Racira Image — Free Image Tools",
    description: "80+ free image tools in your browser. Resize, compress, convert and edit images instantly.",
  },
};

import { categories } from "@/domains/image/registry";

const totalCount = categories.reduce((sum, c) => sum + c.tools.length, 0);

function slugify(s: string) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ImagePage() {
  return (
    <div className="min-h-screen">
      <Header mode="category" categoryName="Image" />

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {/* Hero */}
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              40+ Free Image Tools —{" "}
              <span className="hero-gradient-text">Convert, Resize & Edit</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Essential utilities to convert formats, resize, crop, and compress your images instantly. No signup required.
            </p>
            <div className="relative w-full max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search 40+ image tools..."
                  className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                  aria-label="Search Image Tools"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </section>

        {/* Category nav */}
        <nav aria-label="Categories" className="mb-12 flex flex-wrap gap-2 justify-center">
          {categories.map((c) => (
            <a
              key={c.name}
              href={`#${slugify(c.name)}`}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground hover:text-sky-500 hover:border-sky-400/40 transition-colors"
            >
              {c.name}
            </a>
          ))}
        </nav>

        {/* Tool grid per category */}
        {categories.map((cat) => (
          <section key={cat.name} id={slugify(cat.name)} className="mb-14 scroll-mt-24">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-muted-foreground">
                {cat.name}
              </h2>
              <span className="text-xs text-muted-foreground">{cat.tools.length} tools</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cat.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.slug}
                    href={`/image/tool/${tool.slug}`}
                    className="tool-card group"
                  >
                    <div className="mb-4 inline-flex items-center justify-center h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
                    {tool.built ? (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-500">
                        Open <ArrowRight className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="mt-3 inline-block text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/70">
                        Coming soon
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Racira Image — {totalCount} free image tools. Runs entirely in your browser.
      </footer>
    </div>
  );
}
