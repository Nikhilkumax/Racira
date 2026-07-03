import { SiteFooter } from "@/components/music/site-chrome";
import Header from "@/components/Header";
import { ToolCard } from "@/components/music/tool-card";
import { categories, totalTools } from "@/lib/music/tools-data";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header mode="category" categoryName="Music" />
      <main className="flex-1">
        <section className="racira-page-container pb-12 pt-16 text-center sm:px-6 sm:pt-24">
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            All Music Tools You Need —{" "}
            <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">
              Fast, Simple &amp; Free
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Make beats, build chords, explore scales, design sounds and prep releases.{" "}
            {totalTools}+ free music tools in your browser. No signup required.
          </p>
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
                  <ToolCard key={t.slug} tool={t} />
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
