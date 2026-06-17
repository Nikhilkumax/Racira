import { sitemapSources, paginate } from "@/lib/sitemap/sitemapSources";

export async function generateStaticParams() {
  const params: { key: string; category: string; page: string }[] = [];
  for (const source of sitemapSources) {
    for (const categorySlug of source.getCategorySlugs()) {
      const pages = paginate(source.getEntriesForCategory(categorySlug));
      pages.forEach((_, i) => params.push({ key: source.key, category: categorySlug, page: String(i + 1) }));
    }
  }
  return params;
}

export async function GET(request: Request, context: any) {
  const { key, category, page } = context.params;
  const source = sitemapSources.find(s => s.key === key);
  if (!source) return new Response("Not Found", { status: 404 });

  const pages = paginate(source.getEntriesForCategory(category));
  const pageIndex = parseInt(page, 10) - 1;
  const entries = pages[pageIndex];
  if (!entries || entries.length === 0) return new Response("Not Found", { status: 404 });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  entries.forEach(e => {
    xml += `<url><loc>${e.loc}</loc>`;
    if (e.lastmod) xml += `<lastmod>${e.lastmod}</lastmod>`;
    xml += `</url>`;
  });
  xml += `</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, s-maxage=86400" },
  });
}
