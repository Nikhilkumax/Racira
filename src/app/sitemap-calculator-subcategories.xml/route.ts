import { CATEGORY_SUMMARY } from "@/app/calculator/summaryData";
import { toSlug } from "@/lib/utils/slug";

export async function GET() {
  const baseUrl = "https://racira.com";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  CATEGORY_SUMMARY.forEach(c => {
    const catSlug = toSlug(c.category);
    c.subcategories.filter(sub => sub.count > 0).forEach(sub => {
      const subSlug = toSlug(sub.name);
      xml += `
  <url>
    <loc>${baseUrl}/calculator/${subSlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
  });

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
