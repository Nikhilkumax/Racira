import { Dumbbell } from "lucide-react";
import Header from "@/components/Header";
import Link from "next/link";
import { categories, FUNCTIONAL_SLUGS } from "@/lib/fitness/tools-data";


export default function Home() {
  const total = categories.reduce((n, c) => n + c.tools.length, 0);
  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Fitness" />
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
                      className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 hover:-translate-y-[3px] hover:border-primary/40 hover:shadow-[0_8px_24px_hsl(var(--ring)/0.1)] transition-all"
                    >
                      {!active && (
                        <span className="absolute top-3 right-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Soon
                        </span>
                      )}
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center mb-4">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-foreground leading-snug">
                        {t.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.desc}</p>
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
