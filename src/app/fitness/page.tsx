import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { categories, FUNCTIONAL_SLUGS } from "@/lib/fitness/tools-data";
import { SiteHeader } from "@/components/fitness/SiteHeader";

export default function Home() {
  const total = categories.reduce((n, c) => n + c.tools.length, 0);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6">
        <section className="py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            All Fitness Tools You Need —{" "}
            <span className="text-brand">Strong, Simple &amp; Free</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg">
            Plan workouts, track progress, calculate macros and recover smarter. {total}+ free fitness &amp; nutrition tools in your browser. No signup required.
          </p>
        </section>

        <div className="space-y-12 pb-24">
          {categories.map((cat) => (
            <section key={cat.name}>
              <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4">
                {cat.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cat.tools.map((t) => {
                  const active = FUNCTIONAL_SLUGS.has(t.slug);
                  return (
                    <Link
                      key={t.slug}
                      href={`/tools/${t.slug}`}
                      className="group relative rounded-xl border border-border bg-card p-5 hover:border-brand hover:shadow-[0_4px_20px_-8px_var(--brand)] transition"
                    >
                      <div className="h-10 w-10 rounded-lg bg-brand-soft text-brand inline-flex items-center justify-center">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-semibold text-card-foreground">
                        {t.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                      {!active && (
                        <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Racira Fitness — built for athletes, coaches and beginners.
      </footer>
    </div>
  );
}
