"use client";

import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { findTool } from "@/domains/fitness/registry";
import { ArrowLeft } from "lucide-react";
import { trackPageView } from "@/lib/analytics";
import { useEffect } from "react";

interface ComingSoonFitnessProps {
  slug: string;
}

const ComingSoonFitness = ({ slug }: ComingSoonFitnessProps) => {
  const tool = findTool(slug);

  const name = tool?.name || "Fitness Tool";
  const description = tool?.desc || "This fitness tool is coming soon.";
  
  useEffect(() => {
    trackPageView(`/fitness/${slug}`, { status: "coming_soon", name });
  }, [slug, name]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "applicationCategory": "HealthAndFitnessApplication",
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
          { label: "Fitness Tools", href: "/fitness" },
          { label: name },
        ]}
      />
      <div className="racira-page-container py-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{name}</h1>
        <p className="text-muted-foreground mb-8">{description}</p>

        <div className="card-calculator text-center py-16 mb-8">
          <p className="text-4xl mb-4">🚧</p>
          <p className="text-lg font-semibold text-foreground mb-2">Coming Soon</p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
            This fitness tool is planned for a future Racira release. We're building it with privacy and performance in mind—running entirely in your browser. Check back soon!
          </p>
          <Link
            href="/fitness"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Fitness Tools
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonFitness;
