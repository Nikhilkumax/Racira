import Header from "@/components/Header";
import Link from "next/link";
import { categories, totalCount } from "@/domains/design/registry";
import { Search } from "lucide-react";

export const metadata = {
  title: "Racira Design — 144 Free Design Tools in Your Browser",
  description: "Layouts, icons, vectors, logos, UI kits, mockups and more. 144 free design tools — fast, simple, no signup.",
  openGraph: {
    title: "Racira Design — 144 Free Design Tools",
    description: "144 free design tools in your browser. No signup required."
  }
};

export default function Index() {
  return (
    <div className="min-h-screen">
      <Header mode="category" categoryName="Design" />
      <main className="racira-page-container pb-24">
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            15+ Free Design Tools —{" "}
            <span className="hero-gradient-text">Assets, Layouts & Mockups</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Generate mockups, extract assets, and perfect your layouts with our design utilities. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 15+ design tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Design Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>

        <nav aria-label="Categories" className="mb-12 flex flex-wrap gap-2 justify-center">
          {categories.map((c) => (
            <a
              key={c.name}
              href={`#${slugify(c.name)}`}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              {c.name}
            </a>
          ))}
        </nav>

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
                    href={`/tool/${tool.slug}`}
                    className="tool-card group"
                  >
                    {!tool.built && (
                      <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                        Soon
                      </span>
                    )}
                    <div className="mb-4 inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}



function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
      Racira Design — {totalCount} free design tools.
    </footer>
  );
}
