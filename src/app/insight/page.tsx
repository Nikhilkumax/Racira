import { CATEGORIES } from "@/lib/insight/tools-data";
import Header from "@/components/Header";
import { CategorySection } from "@/components/insight/CategorySection";


export default function Index() {
  const total = CATEGORIES.reduce((s, c) => s + c.tools.length, 0);
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <Header mode="category" categoryName="Insight" />
      <main className="flex-1 w-full">
        <section className="px-4 pb-12 pt-16 sm:pt-24 w-full">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              All Data &amp; Chart Tools You Need —{" "}
              <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
                Fast, Simple &amp; Free
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Visualize, clean, analyze and share data. {total} free data &amp; chart tools in your
              browser. No signup required.
            </p>
          </div>
        </section>

        <section id="categories" className="racira-page-container pb-24 sm:px-6 w-full">
          {CATEGORIES.map((c) => (
            <CategorySection key={c.name} name={c.name} icon={c.icon} tools={c.tools} />
          ))}
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground w-full">
        © {new Date().getFullYear()} Racira Data &amp; Charts
      </footer>
    </div>
  );
}
