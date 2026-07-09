import { CategorySearch } from "@/components/CategorySearch";
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
          <CategorySearch categorySlug="animator" placeholder="Search 130+ animation tools..." registry={(Array.isArray(categories) ? categories.flatMap((cat: any) => (cat.tools || []).map((t: any) => ({ name: (t as any).name, description: (t as any).description || '', slug: (t as any).slug, href: ((t as any).slug || '').startsWith('/') ? (t as any).slug : `/animator/tools/${(t as any).slug}`, category: (cat as any).name || (cat as any).title || (cat as any).label || '', isBuilt: (t as any).built !== false }))) : [])} />
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
                  key={(t as any).slug}
                  href={`/tool/${(t as any).slug}`}
                  className="tool-card group"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground leading-snug">{(t as any).name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{(t as any).desc}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
