import Link from "next/link";
import Header from "@/components/Header";
import { categories, totalCount, SEARCH_REGISTRY } from "@/domains/travel/registry";
import { categoryIcons, fallbackIcon } from "@/domains/travel/lib/category-icons";
import { SiteFooter } from "@/domains/travel/components/site-chrome";
import { Search,  Compass  } from "lucide-react";
import { CategorySearch } from "@/components/CategorySearch";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header mode="category" categoryName="Travel" />
      <main className="racira-page-container">
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            122 Free Travel Tools —{" "}
            <span className="hero-gradient-text">Currency, Time & Distance</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Plan your trips with currency converters, time zone calculators, and distance metrics. No signup required.
          </p>
          <CategorySearch categorySlug="travel" placeholder="Search 122 travel tools..." registry={SEARCH_REGISTRY} />
        </div>
      </section>

        {categories.map((cat) => {
          return (
            <section key={cat.name} className="mb-14">
              <div className="mb-5 flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {cat.name}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cat.tools.map((tool) => {
                  const Icon = (tool as any).icon as React.ComponentType<{ className?: string }>;
                  const isLive = (tool as any).status === "live";
                  return (
                    <Link
                      key={tool.slug}
                      href={`/travel/${tool.slug}`}
                      className="tool-card group relative"
                    >
                      {!isLive && (
                        <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Soon
                        </span>
                      )}
                      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-foreground leading-snug">
                        {tool.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
