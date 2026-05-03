import { MetadataRoute } from "next";
import { calculatorRegistry } from "@/data/calculatorRegistry";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://racira.com";

  // Platform & Category Pages
  const platformPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pdf-tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image-tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ai-tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Static Info Pages
  const staticPages: MetadataRoute.Sitemap = [
    "about",
    "contact",
    "privacy-policy",
    "terms-of-service",
    "disclaimer",
  ].map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Dynamic Calculator Pages
  const calculatorPages: MetadataRoute.Sitemap = calculatorRegistry.map((calc) => ({
    url: `${baseUrl}/calculator/${calc.slug}`,
    lastModified: new Date(),
    changeFrequency: calc.isBuilt ? "monthly" : "yearly",
    priority: calc.isBuilt ? 0.7 : 0.4,
  }));

  return [...platformPages, ...staticPages, ...calculatorPages];
}
