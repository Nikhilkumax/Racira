import Link from "next/link";
import { categories, totalCount } from "@/lib/travel/tools";
import { categoryIcons, fallbackIcon } from "@/lib/travel/category-icons";
import { SiteFooter, SiteHeader } from "@/components/travel/site-chrome";
import { Compass } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4">
        <section className="py-20 text-center sm:py-28">
          <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            All Travel Tools You Need —{" "}
            <span style={{ color: "var(--sky)" }}>Fast,</span>{" "}
            <span className="bg-gradient-to-r from-[var(--sky)] to-sky-400 bg-clip-text text-transparent">
              Simple &amp; Free
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Plan trips, pack smart, budget better and travel safer. {totalCount}+ free travel tools in your browser. No signup required.
          </p>
        </section>

        {categories.map((cat) => {
          const Icon = categoryIcons[cat.name] ?? fallbackIcon;
          return (
            <section key={cat.name} className="mb-14">
              <div className="mb-5 flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: "var(--sky)" }} />
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {cat.name}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cat.tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tool/${tool.slug}`}
                    className="group rounded-xl border border-border bg-card p-5 transition hover:border-[var(--sky)] hover:shadow-md"
                  >
                    <div
                      className="mb-4 grid h-10 w-10 place-items-center rounded-lg"
                      style={{ backgroundColor: "var(--sky-soft)" }}
                    >
                      <Compass className="h-5 w-5" style={{ color: "var(--sky)" }} />
                    </div>
                    <h3 className="font-display text-base font-bold leading-snug">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{tool.desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
