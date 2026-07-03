import { categories, totalCount } from "@/lib/animator/tools";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Index() {
  return (
    <main className="min-h-screen">
      <section className="px-4 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-[#EC4899]" />
            {totalCount} animation tools, no signup
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            All Animation Tools You Need — <span className="text-gradient-pink">Fast, Simple & Free</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Build, preview, export and audit animations. {totalCount} free animation tools in your browser. No signup required.
          </p>
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
