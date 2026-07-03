"use client";

import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import { getCalculatorBySlug } from "@/data/calculatorRegistry";
import { ArrowLeft } from "lucide-react";
import { trackPageView } from "@/lib/analytics";
import { useEffect } from "react";

interface ComingSoonCalculatorProps {
  slug: string;
}

const ComingSoonCalculator = ({ slug }: ComingSoonCalculatorProps) => {
  const calc = getCalculatorBySlug(slug);

  const name = calc?.name || "Calculator";
  const description = calc?.description || "This calculator is coming soon.";
  
  useEffect(() => {
    trackPageView(`/calculator/${slug}`, { status: "coming_soon", name });
  }, [slug, name]);
  // For metadata or displaying category if needed, though name and description covers it.

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "applicationCategory": "CalculatorApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: name },
        ]}
      />
      <div className="racira-page-container py-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{name}</h1>
        <p className="text-muted-foreground mb-8">{description}</p>

        <div className="card-calculator text-center py-16 mb-8">
          <p className="text-4xl mb-4">🚧</p>
          <p className="text-lg font-semibold text-foreground mb-2">Coming Soon</p>
          <p className="text-sm text-muted-foreground racira-page-container mb-6">
            This calculator is planned for a future Racira release. We&apos;re building this calculator with the same professional-grade accuracy as our existing tools. Check back soon!
          </p>
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calculators
          </Link>
        </div>

        <PopularCalculators exclude={`/calculator/${slug}`} />
      </div>
    </div>
  );
};

export default ComingSoonCalculator;
