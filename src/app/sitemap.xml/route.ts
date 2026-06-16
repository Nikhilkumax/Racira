import { CATEGORY_SUMMARY } from "@/app/calculator/summaryData";
import { toSlug } from "@/lib/utils/slug";

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
  CATEGORY_SUMMARY.forEach(c => {
    const catSlug = toSlug(c.category);
    xml += `  <sitemap>
    <loc>${baseUrl}/sitemap-calculators-${catSlug}.xml</loc>
  </sitemap>\n`;
  });

  xml += `</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
