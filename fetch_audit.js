const fs = require('fs');
const http = require('http');

function slugify(s) {
  if (!s) return '';
  return s.toLowerCase().replace(/&/g, "and").replace(/\\//g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

http.get('http://localhost:3007/api/audit', (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      let mdOutput = '# Domain URL Audit\\n\\n';
      
      for (const [domain, registry] of Object.entries(data)) {
        mdOutput += `## Domain: ${domain}\\n`;
        mdOutput += `| Page Type | Old Path | New Path | Indexed? | Redirect Needed? |\\n`;
        mdOutput += `| --- | --- | --- | --- | --- |\\n`;

        const categories = new Set();
        const subcategories = new Set();
        const tools = new Set();
        const slugs = new Map();

        for (const item of registry) {
          tools.add(JSON.stringify({ name: item.name, slug: item.slug, href: item.href }));
          if (item.category) categories.add(item.category);
          if (item.subcategory) subcategories.add(JSON.stringify({ category: item.category, subcategory: item.subcategory }));
        }

        const isLiveDomain = domain === 'calculator' || domain === 'voice';

        for (const t of tools) {
          const item = JSON.parse(t);
          const oldPath = item.href;
          const newPath = `/${domain}/${item.slug}`;
          const compliant = oldPath === newPath;
          const redirect = (!compliant && isLiveDomain) ? 'Yes' : 'No';
          mdOutput += `| Tool | \`${oldPath}\` | \`${newPath}\` | Yes | ${redirect} |\\n`;
          slugs.set(item.slug, (slugs.get(item.slug) ? slugs.get(item.slug) + ', Tool' : 'Tool'));
        }

        for (const c of categories) {
          const slug = slugify(c);
          let oldPath = `/${domain}/${slug}`;
          if (domain === 'developers') oldPath = `/${domain}/tools/${slug}`;
          const newPath = `/${domain}/${slug}`;
          mdOutput += `| Category | \`${oldPath}\` | \`${newPath}\` | No | No |\\n`;
          slugs.set(slug, (slugs.get(slug) ? slugs.get(slug) + ', Category' : 'Category'));
        }

        for (const s of subcategories) {
          const item = JSON.parse(s);
          const catSlug = slugify(item.category);
          const subSlug = slugify(item.subcategory);
          const oldPath = `/${domain}/${catSlug}/${subSlug}`;
          const newPath = `/${domain}/${subSlug}`;
          mdOutput += `| Subcategory | \`${oldPath}\` | \`${newPath}\` | No | No |\\n`;
          slugs.set(subSlug, (slugs.get(subSlug) ? slugs.get(subSlug) + ', Subcategory' : 'Subcategory'));
        }
        
        const collisions = [...slugs.entries()].filter(([k, v]) => v.includes(','));
        if (collisions.length > 0) {
          mdOutput += `\\n> [!WARNING]\\n> **Collisions for ${domain}:**\\n`;
          for (const [slug, types] of collisions) {
            mdOutput += `> - \`${slug}\` is used by: ${types}\\n`;
          }
        }
        mdOutput += '\\n';
      }
      
      fs.writeFileSync('C:\\\\Users\\\\nikhi\\\\.gemini\\\\antigravity\\\\scratch\\\\audit_output.md', mdOutput, 'utf8');
      console.log('Done!');
    } catch (e) {
      console.error(e);
      console.log('Raw body:', body.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.error("Error fetching:", e);
});
