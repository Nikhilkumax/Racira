import { tools, categories } from "@/data/pdf/tools";
import ToolCard from "@/components/pdf/ToolCard";

const Index = () => {
  return (
    <main>
      {/* Hero */}
      <section className="py-12 sm:py-16 text-center">
        <div className="container max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            All PDF Tools You Need — <span className="text-primary">Fast, Simple & Free</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Merge, split, compress, convert and secure PDFs in seconds. No signup required.
          </p>
        </div>
      </section>

      {/* Tool Grid by Category */}
      <section className="pb-16">
        <div className="racira-page-container">
          {categories.map((category) => (
            <div key={category} className="mb-10 last:mb-0">
              <h2 className="text-xl font-bold text-foreground mb-4">{category}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-5">
                {tools
                  .filter((t) => t.category === category)
                  .map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Index;
