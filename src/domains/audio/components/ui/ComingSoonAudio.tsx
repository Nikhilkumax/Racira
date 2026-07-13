"use client";

import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { getAudioToolBySlug } from "@/domains/audio/registry";
import { ArrowLeft } from "lucide-react";
import { trackPageView } from "@/lib/analytics";
import { useEffect } from "react";

interface ComingSoonAudioProps {
  slug: string;
}

const ComingSoonAudio = ({ slug }: ComingSoonAudioProps) => {
  const tool = getAudioToolBySlug(slug);

  const name = tool?.name || "Audio Tool";
  const description = tool?.description || "This audio tool is coming soon.";
  
  useEffect(() => {
    trackPageView(`/audio/${slug}`, { status: "coming_soon", name });
  }, [slug, name]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "applicationCategory": "MultimediaApplication",
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
          { label: "Audio Tools", href: "/audio" },
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
            This audio tool is planned for a future Racira release. We're building it with privacy and performance in mind—running entirely in your browser. Check back soon!
          </p>
          <Link
            href="/audio"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Audio Tools
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonAudio;
