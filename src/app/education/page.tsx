"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, GraduationCap } from "lucide-react";
import { categories, allTools } from "@/domains/education/registry";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!query) return categories;
    return categories
      .map((c) => ({
        ...c,
        tools: c.tools.filter(
          (t) =>
            t.name.toLowerCase().includes(query) ||
            t.desc.toLowerCase().includes(query),
        ),
      }))
      .filter((c) => c.tools.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="racira-page-container h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">
              <span className="text-primary">Racira</span> Education
            </span>
          </Link>
          <a
            href="#tools"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Browse tools
          </a>
        </div>
      </header>

      <section className="racira-page-container pt-20 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
          All Education Tools You Need —{" "}
          <span className="text-primary">Fast, Simple &amp; Free</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Plan, study, teach and assess. {allTools.length} free education tools right in your browser. No signup required.
        </p>
        <div className="mt-8 max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${allTools.length} tools...`}
            className="pl-9 h-12 text-base"
          />
        </div>
      </section>

      <main id="tools" className="racira-page-container pb-24 space-y-12">
        {filteredCategories.length === 0 && (
          <p className="text-center text-muted-foreground">No tools match "{q}".</p>
        )}
        {filteredCategories.map((cat) => (
          <section key={cat.id}>
            <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4">
              {cat.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cat.tools.map((t) => {
                const Icon = t.icon;
                return (
                  <Link
                    key={t.slug}
                    href={`/tool/${t.slug}`}
                    className="tool-card group"
                  >
                    {!t.built && (
                      <span className="absolute top-3 right-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Soon
                      </span>
                    )}
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">
                      {t.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {t.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Racira Education · {allTools.length} tools for learners and teachers
      </footer>
    </div>
  );
}
