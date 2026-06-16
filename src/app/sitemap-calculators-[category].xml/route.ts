import { calculatorRegistry } from "@/data/calculatorRegistry";
import { CATEGORY_SUMMARY } from "@/app/calculator/summaryData";
import { toSlug } from "@/lib/utils/slug";

export async function generateStaticParams() {
  return CATEGORY_SUMMARY.map(c => ({
    category: toSlug(c.category),
  }));
}

export async function GET(request: Request, context: any) {
  const baseUrl = "https://racira.com";
  
  if (!context || !context.params || !context.params.category) {
    return new Response("Not Found", { status: 404 });
  }
  const params = context.params;

  // Filter tools for this category
  // Handle edge cases where calculator category might not exactly match category slug logic by using toSlug
  const categoryTools = calculatorRegistry.filter(calc => {
    if (!calc) return false;
    return toSlug(calc.category || "general") === params.category;
  });

  if (categoryTools.length === 0) {
    return new Response("Not Found", { status: 404 });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  categoryTools.forEach(calc => {
    const toolSlug = calc.slug || toSlug(calc.name);
    xml += `
  <url>
    <loc>${baseUrl}/calculator/${toolSlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${calc.isBuilt ? 'monthly' : 'yearly'}</changefreq>
    <priority>${calc.isBuilt ? '0.8' : '0.5'}</priority>
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
