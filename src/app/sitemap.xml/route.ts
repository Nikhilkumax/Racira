import { sitemapSources, paginate } from "@/lib/sitemap/sitemapSources";

export async function GET() {
  const baseUrl = "https://racira.com";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-calculator-categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-calculator-subcategories.xml</loc>
  </sitemap>
`;

  // Add individual category files dynamically
  sitemapSources.forEach(source => {
    source.getCategorySlugs().forEach(categorySlug => {
      const pageCount = paginate(source.getEntriesForCategory(categorySlug)).length;
      for (let p = 1; p <= pageCount; p++) {
        xml += `  <sitemap><loc>${baseUrl}/sitemaps/${source.key}/${categorySlug}/${p}</loc></sitemap>\n`;
      }
    });
  });

  xml += `</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
