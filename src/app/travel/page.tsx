import Link from "next/link";
import Header from "@/components/Header";
import { categories, totalCount } from "@/domains/travel/registry";
import { categoryIcons, fallbackIcon } from "@/domains/travel/lib/category-icons";
import { SiteFooter } from "@/domains/travel/components/site-chrome";
import { Search,  Compass  } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header mode="category" categoryName="Travel" />
      <main className="racira-page-container">
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            25+ Free Travel Tools —{" "}
            <span className="hero-gradient-text">Currency, Time & Distance</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Plan your trips with currency converters, time zone calculators, and distance metrics. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 25+ travel tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Travel Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
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
                    className="tool-card group"
                  >
                    <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Compass className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
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
