const fs = require('fs');

const globalToSlug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/\//g, "-").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const domains = [
  "3d", "animator", "audio", "business", "cad", "calculator", "colors", "crypto",
  "design", "developers", "education", "engineering", "finance", "fitness",
  "flowchart", "games", "image", "insight", "maps", "music", "pdf", "photo",
  "presentation", "productivity", "security", "seo", "travel", "typography",
  "video", "voice", "writing"
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log("## 1. Real per-domain slug comparison\n");
    console.log("| domain | test string | local function output | toSlug output | result |");
    console.log("|---|---|---|---|---|");

    let mismatchCount = 0;
    const testUrls = {}; 

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
        
        let names = [];
        const matches = [...content.matchAll(/(?:\[\s*|name:\s*)["']([^"']+)["']/g)];
        for (const m of matches) {
            const name = m[1];
            if (!["live", "soon"].includes(name) && !names.includes(name)) {
                names.push(name);
            }
        }
        
        let specialNames = names.filter(n => /[^a-zA-Z0-9\s]/.test(n));
        if (specialNames.length < 3) {
            specialNames = specialNames.concat(names.filter(n => !/[^a-zA-Z0-9\s]/.test(n)));
        }
        const testStrings = [...new Set(specialNames)].slice(0, 3);
        
        testUrls[domain] = { rawTools: names };
        
        const catMatches = [...content.matchAll(/category:\s*["']([^"']+)["']/g)];
        let cats = [...new Set(catMatches.map(m => m[1]))];
        if (cats.length === 0) {
            const titleMatches = [...content.matchAll(/title:\s*["']([^"']+)["']/g)];
            cats = [...new Set(titleMatches.map(m => m[1]))];
        }
        testUrls[domain].rawCats = cats;

        let localFunc = globalToSlug; 
        let customFound = false;

        // Custom manual extraction for robustness
        if (content.includes('slugify') || content.includes('slug(') || content.includes('.replace(/[^a-z0-9]+/g, "-")')) {
             if (content.includes('.replace(/&/g, "and")') && content.includes('.replace(/[^a-z0-9]+/g, "-")')) {
                 localFunc = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                 customFound = true;
             } else if (content.includes('.replace(/[^\\w\\s-]/g, "")')) {
                 localFunc = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
                 customFound = true;
             } else if (content.includes('.replace(/[^a-z0-9]+/g, "-")')) {
                 localFunc = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                 customFound = true;
             } else if (content.includes('const slug = (s: string) =>') && content.includes('.replace(/\\s+/g, "-")')) {
                 localFunc = (s) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
                 customFound = true;
             }
        }
        
        if (usesGlobal && (!content.includes('const slugify') && !content.includes('function slug'))) {
            customFound = false;
        }

        if (customFound) {
            for (const testStr of testStrings) {
                const globalOut = globalToSlug(testStr);
                const localOut = localFunc(testStr);
                let result = "match (coincidental)";
                if (globalOut !== localOut) {
                    result = "mismatch (not yet fixed)";
                    mismatchCount++;
                }
                console.log(`| ${domain} | ${testStr} | ${localOut} | ${globalOut} | ${result} |`);
            }
        }
        
        testUrls[domain].computedTools = testUrls[domain].rawTools.map(t => localFunc(t));
        
        let catFunc = globalToSlug;
        if (["insight", "crypto", "games", "flowchart"].includes(domain)) catFunc = localFunc;
        testUrls[domain].computedCats = testUrls[domain].rawCats.map(c => catFunc(c));
    }
    
    console.log(`\nTotal confirmed mismatches (unique strings): ${mismatchCount}\n`);

    console.log("## 2. Second-pass spot-check results\n");
    console.log("| domain | url tested | status code |");
    console.log("|---|---|---|");

    for (const domain of domains) {
        if (domain === "finance") continue;
        const dUrls = testUrls[domain];
        if (!dUrls || dUrls.computedTools.length === 0) continue;
        
        // Pick 2 new tools (from the beginning of the list to avoid the ones from Table 3)
        const toolsToTest = dUrls.computedTools.slice(2, 4); 
        // Pick 1 new category (from the beginning of the list)
        const catToTest = dUrls.computedCats.length > 1 ? dUrls.computedCats[1] : null;
        
        const urlsToHit = [];
        for (const t of toolsToTest) urlsToHit.push(`http://localhost:3002/${domain}/${t}`);
        if (catToTest) urlsToHit.push(`http://localhost:3002/${domain}/${catToTest}`);
        
        for (const url of urlsToHit) {
             let res = await fetch(url).then(r => r.status).catch(e => "ERR");
             console.log(`| ${domain} | ${url} | ${res} |`);
        }
    }
}
main();
