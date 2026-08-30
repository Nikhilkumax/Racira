const fs = require('fs');
const toolsSrc = fs.readFileSync('src/domains/pdf/registry/tools.ts', 'utf8');
const seoSrc = fs.readFileSync('src/domains/pdf/registry/tool-seo.ts', 'utf8');

// Get ALL slugs registered in explicitSeo
const seoSlugs = new Set();
const seoRegex = /"([^"]+)":\s*(?:seo|pilot|split|compress|rotate)[A-Za-z]*/g;
let m;
while ((m = seoRegex.exec(seoSrc)) !== null) seoSlugs.add(m[1]);

const cats = ['Organize PDF', 'Convert from PDF', 'Convert to PDF'];
cats.forEach(cat => {
  // Match: slug: 'xxx', ... status: "live", ... subCategory: 'Cat Name'
  const regex = /slug:\s*'([^']+)'[^}]*status:\s*"live"[^}]*subCategory:\s*'([^']+)'/g;
  const tools = [];
  while ((m = regex.exec(toolsSrc)) !== null) {
    if (m[2] === cat) tools.push({ slug: m[1], hasSeo: seoSlugs.has(m[1]) });
  }
  const remaining = tools.filter(t => !t.hasSeo);
  console.log('=== ' + cat + ' ===');
  console.log('Total live: ' + tools.length + ', With SEO: ' + (tools.length - remaining.length) + ', Remaining: ' + remaining.length);
  if (remaining.length > 0) {
    console.log('Remaining tools:');
    remaining.forEach(t => {
      // Check if there's a const declaration for this slug
      const varName = 'seo' + t.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      const hasConst = seoSrc.includes('const ' + varName);
      const hasRegistration = seoSrc.includes('"' + t.slug + '":');
      console.log('  - ' + t.slug + ' (const: ' + hasConst + ', registered: ' + hasRegistration + ')');
    });
  }
  console.log('');
});
