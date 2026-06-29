/**
 * src/app/sitemap.ts
 *
 * Next.js 14 App Router native sitemap generation.
 * Reads the live tool registry from src/data/tools.ts — there is NO
 * separately maintained hand-list, so drift between registry and sitemap
 * is structurally impossible.
 *
 * URL pattern: https://racira.com/pdf/{slug}
 * (PDF category prefix — per platform /{category}/{slug} architecture)
 *
 * NOTE ON SITEMAPSOURCES:
 * The prompt references a `sitemapSources` registry pattern. That pattern
 * does not exist in this Next.js codebase — it existed in the original
 * Vite/TanStack source but was never migrated. This file IS the canonical
 * sitemap source for this project; the tools array in src/data/tools.ts is
 * the single source of truth.
 */

import type { MetadataRoute } from "next";
import { tools } from "@/data/pdf/tools";

const BASE_URL = "https://racira.com";

/**
 * Homepage + /pdf hub + all 193 PDF tool pages.
 *
 * Priority tiers:
 *  - Homepage:           1.0
 *  - /pdf category hub:  0.9
 *  - All tool pages:     0.8
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pdfTools = tools.filter((t) => t.category === "pdf");

  const toolEntries: MetadataRoute.Sitemap = pdfTools.map((tool) => ({
    url: `${BASE_URL}/pdf/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/pdf`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...toolEntries,
  ];
}
