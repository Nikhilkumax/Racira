const fs = require('fs');

const globalToSlug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/\//g, "-").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const domains = [
  "3d", "animator", "audio", "business", "cad", "calculator", "colors", "crypto",
  "design", "developers", "education", "engineering", "finance", "fitness",
  "flowchart", "games", "image", "insight", "maps", "music", "pdf", "photo",
  "presentation", "productivity", "security", "seo", "travel", "typography",
  "video", "voice", "writing"
];

console.log("| domain | test string | local function output | toSlug output | result |");
console.log("|---|---|---|---|---|");

const testStrings = [
    "A/B Testing & Optimization (ROI)",
    "Image to PDF Converter"
];

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
    const usesGlobal = content.includes('import { toSlug }') || content.includes('import {toSlug}');
    
    let localSlugifierCode = null;
    let type = "unknown";
    
    // Find the slugify function definition
    let match = content.match(/(?:const|function)\s+(?:slugify|slug)\s*(?:=|:|\().*?(?:=>|\{)\s*([\s\S]*?)(?:;|\n\s*export)/);
    if (match) {
        let code = match[0];
        // Convert TS to JS for eval
        code = code.replace(/:\s*string/g, "");
        code = code.replace(/export\s+/, "");
        
        // Just extract the return value part if it's a simple arrow func
        if (code.includes('=>')) {
            const body = code.split('=>')[1].trim().replace(/;$/, "");
            if (!body.startsWith('{')) {
                localSlugifierCode = `return ${body};`;
            } else {
                localSlugifierCode = body.slice(1, -1);
            }
        } else if (code.includes('{')) {
            const body = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'));
            localSlugifierCode = body;
        }
    } else if (content.includes('.replace(/[^a-z0-9]+/g, "-")')) {
         if (content.includes('.replace(/&/g, "and")')) {
             localSlugifierCode = 'return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");';
         } else {
             localSlugifierCode = 'return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");';
         }
    }

    if (usesGlobal && !localSlugifierCode) continue; // Uses only global
    if (usesGlobal && content.includes('const slugify = toSlug')) continue;

    if (localSlugifierCode) {
        try {
            const localFunc = new Function("s", localSlugifierCode);
            // Verify it works
            localFunc("test");
            
            for (const testStr of testStrings) {
                const globalOut = globalToSlug(testStr);
                const localOut = localFunc(testStr);
                let result = "match (coincidental)";
                if (globalOut !== localOut) {
                    result = "mismatch (not yet fixed)";
                }
                console.log(`| ${domain} | ${testStr} | ${localOut} | ${globalOut} | ${result} |`);
            }
        } catch(e) {
            console.log(`| ${domain} | error parsing | N/A | N/A | ${e.message} |`);
        }
    }
}
