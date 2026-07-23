import ClientGrid from "@/domains/pdf/components/ClientGrid";
import { CategorySearch } from "@/components/CategorySearch";
import { SEARCH_REGISTRY } from "@/domains/pdf/registry/tools";

const Index = () => {
  return (
    <main>
      {/* Hero */}
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            183+ Free PDF Tools —{" "}
            <span className="hero-gradient-text">Merge, Split & Compress</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Professional-grade tools to merge, split, compress, and edit PDF documents securely. No signup required.
          </p>
          <CategorySearch
            categorySlug="pdf"
            placeholder="Search 183+ PDF tools..."
            registry={SEARCH_REGISTRY}
          />
        </div>
      </section>

      {/* Tool Grid by Subcategory */}
      <ClientGrid />
    </main>
  );
};

export default Index;
