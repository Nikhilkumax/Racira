import { CategorySearch } from "@/components/CategorySearch";
﻿import { SiteFooter } from "@/domains/music/components/site-chrome";
import Header from "@/components/Header";
import { ToolCard } from "@/domains/music/components/tool-card";
import { categories, totalTools } from "@/domains/music/registry";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header mode="category" categoryName="Music" />
      <main className="flex-1">
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            30+ Free Music Tools —{" "}
            <span className="hero-gradient-text">BPM, Scales & Tuners</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Essential tools for musicians including BPM counters, scale references, and online tuners. No signup required.
          </p>
          <CategorySearch categorySlug="music" placeholder="Search 30+ music tools..." registry={(categories || []).flatMap((cat: any) => (cat.tools || []).map((t: any) => ({ name: (t as any).name, description: (t as any).description || '', slug: (t as any).slug, href: ((t as any).slug || '').startsWith('/') ? (t as any).slug : `/music/tools/${(t as any).slug}`, category: (cat as any).name || (cat as any).title || (cat as any).label || '', isBuilt: (t as any).built !== false })))} />
        </div>
      </section>

        <div className="mx-auto max-w-6xl space-y-14 px-4 pb-24 sm:px-6">
          {categories.map((cat) => (
            <section key={cat.name} aria-labelledby={`cat-${cat.name}`}>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2
                    id={`cat-${cat.name}`}
                    className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {cat.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground/80">{cat.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">{cat.tools.length} tools</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cat.tools.map((t) => (
                  <ToolCard key={(t as any).slug} tool={t} />
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
