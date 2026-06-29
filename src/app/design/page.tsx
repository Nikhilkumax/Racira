import Link from "next/link";
import { categories, totalCount } from "@/lib/design/tools-data";
import { ArrowRight } from "lucide-react";

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
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="pt-20 pb-16 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05]">
            All Design Tools You Need —{" "}
            <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-transparent">
              Fast, Simple &amp; Free
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Layout, icons, vectors, logos, UI kits, mockups, print, accessibility and more.
            {" "}{totalCount} free design tools in your browser. No signup required.
          </p>
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
                    className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-[0_8px_30px_-12px_color-mix(in_oklab,var(--primary)_30%,transparent)] transition-all"
                  >
                    <div className="mb-4 inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary-soft text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
                    {tool.built ? (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
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
      <Footer />
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-transparent">Racira</span>{" "}
          <span className="text-foreground">Design</span>
        </Link>
        <div className="text-xs text-muted-foreground">{totalCount} tools</div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
      Racira Design — {totalCount} free design tools.
    </footer>
  );
}
