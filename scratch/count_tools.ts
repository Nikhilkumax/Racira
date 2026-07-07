import fs from 'fs';
import path from 'path';

async function main() {
    const categories = [
        "calculator", "pdf", "image", "design", "colors", "video", "business",
        "games", "education", "cad", "fitness", "music", "travel", "crypto",
        "flowchart", "presentation", "typography", "photo", "animator", "voice",
        "audio", "writing", "developers", "finance", "productivity", "3d",
        "insight", "engineering", "security", "maps"
    ];

    const results = [];

    for (const cat of categories) {
        let registryPath = '';
        let totalCount = 0;
        
        try {
            if (fs.existsSync('src/data/' + cat + '/tools.ts')) registryPath = 'src/data/' + cat + '/tools.ts';
            else if (fs.existsSync('src/domains/' + cat + '/registry/index.ts')) registryPath = 'src/domains/' + cat + '/registry/index.ts';
            else if (fs.existsSync('src/domains/' + cat + '/registry.ts')) registryPath = 'src/domains/' + cat + '/registry.ts';
            else if (fs.existsSync('src/data/' + cat + 'Tools.ts')) registryPath = 'src/data/' + cat + 'Tools.ts';
            else if (fs.existsSync('src/data/' + cat + '/audioTools.ts')) registryPath = 'src/data/' + cat + '/audioTools.ts';

            if (!registryPath) {
                results.push({ category: cat, status: "Registry not found" });
                continue;
            }

            const mod = require(path.resolve(registryPath));
            
            if (mod.TOTAL_TOOLS) totalCount = mod.TOTAL_TOOLS;
            else if (mod.totalToolCount) totalCount = mod.totalToolCount;
            else if (mod.totalCount) totalCount = mod.totalCount;
            else if (mod.tools) totalCount = mod.tools.length;
            else if (mod.categories) {
                totalCount = mod.categories.reduce((acc, c) => acc + (c.tools ? c.tools.length : 0), 0);
            } else if (mod.TOOLS) totalCount = mod.TOOLS.length;
            else if (mod.audioCategories) totalCount = mod.audioCategories.reduce((acc, c) => acc + (c.tools ? c.tools.length : 0), 0);
            
            let pagePath = fs.existsSync('src/app/' + cat + '/page.tsx') ? 'src/app/' + cat + '/page.tsx' : 'src/domains/pdf/tools/Index.tsx';
            if (cat === 'calculator') pagePath = 'src/app/calculator/page.tsx';
            
            let pageContent = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf8') : '';
            let claimedCount = 0;
            const match = pageContent.match(/<h1[^>]*>\s*(\d+)\+\s*Free/);
            if (match) claimedCount = parseInt(match[1]);

            results.push({
                category: cat,
                actualCount: totalCount,
                claimedCount: claimedCount,
                match: totalCount === claimedCount
            });

        } catch (e) {
            results.push({ category: cat, status: "Error: " + e.message });
        }
    }
    
    fs.writeFileSync('scratch/counts.json', JSON.stringify(results, null, 2));
    console.log("Counts completed");
}
main();
