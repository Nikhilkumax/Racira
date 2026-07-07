import { categories, totalCount } from "@/domains/animator/registry";
import { Sparkles, Search } from "lucide-react";
import Link from "next/link";

export default function Index() {
  return (
    <main className="min-h-screen">
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            130+ Free Animation Tools —{" "}
            <span className="hero-gradient-text">CSS, SVG & Keyframes</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Generate CSS animations, SVG paths, and keyframe sequences for your web projects. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 130+ animation tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Animation Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>

      <section className="racira-page-container pb-24 sm:px-6">
        {categories.map((cat) => (
          <div key={cat.name} className="mb-12">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {cat.name} <span className="text-[#EC4899]">· {cat.tools.length}</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {cat.tools.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tool/${t.slug}`}
                  className="tool-card group"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground leading-snug">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
