import { CATEGORY_SUMMARY } from "@/app/calculator/summaryData";
import { toSlug } from "@/lib/utils/slug";

export async function GET() {
  const baseUrl = "https://racira.com";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  CATEGORY_SUMMARY.filter(c => c.total > 0).forEach(c => {
    const catSlug = toSlug(c.category);
    xml += `
  <url>
    <loc>${baseUrl}/calculator/${catSlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
