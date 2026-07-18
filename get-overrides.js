const fs = require('fs');

const domains = [
  "3d", "animator", "audio", "business", "cad", "calculator", "colors", "crypto",
  "design", "developers", "education", "engineering", "finance", "fitness",
  "flowchart", "games", "image", "insight", "maps", "music", "pdf", "photo",
  "presentation", "productivity", "security", "seo", "travel", "typography",
  "video", "voice", "writing"
];

const globalToSlug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/\//g, "-").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

console.log("## 3. Deliberate Slug Overrides");
console.log("| domain | tool/category name | hardcoded slug | auto-generated slug |");
console.log("|---|---|---|---|");

for (const domain of domains) {
    if (domain === "finance") continue;
    
    const path = [
      `src/domains/${domain}/registry.ts`,
      `src/domains/${domain}/registry/index.ts`,
      `src/domains/${domain}/registry/tools.ts`,
      `src/data/${domain}/tools.ts`,
      `src/data/${domain}/games.ts`
    ].find(p => fs.existsSync(p));
    
    if (!path) continue;
    
    const content = fs.readFileSync(path, 'utf8');
    
    // Look for objects containing name: "Name" and slug: "slug"
    // We can do this safely by matching both properties in the same block
    const toolBlocks = content.match(/\{(?:[^{}]*)\}/g) || [];
    
    for (const block of toolBlocks) {
        // Skip blocks that don't have explicit literal slug
        if (!block.includes('slug:')) continue;
        
        // Find explicit literal slug
        const slugMatch = block.match(/slug:\s*["']([^"']+)["']/);
        if (!slugMatch) continue;
        
        // Find name
        const nameMatch = block.match(/name:\s*["']([^"']+)["']/);
        if (!nameMatch) continue;
        
        const hardcodedSlug = slugMatch[1];
        const name = nameMatch[1];
        const autoSlug = globalToSlug(name);
        
        // Skip if hardcoded slug is exactly the auto-generated slug (not really an override)
        if (hardcodedSlug !== autoSlug) {
            console.log(`| ${domain} | ${name} | ${hardcodedSlug} | ${autoSlug} |`);
        }
    }
}
