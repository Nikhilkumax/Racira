import { onlyLive } from "../../src/lib/tools/liveToolFilters";
import { calculatorRegistry } from "../../src/domains/calculator/registry";
import { readFileSync } from "fs";

async function main() {
  const live = onlyLive(calculatorRegistry) as any[];
  const seen = new Map<string, any[]>();
  for (const t of live) {
    if (!seen.has(t.slug)) seen.set(t.slug, []);
    seen.get(t.slug)!.push(t);
  }
  for (const [slug, entries] of seen) {
    if (entries.length < 2) continue;
    console.log(`\nDUP ${slug}:`);
    for (const e of entries) {
      // locate in source
      let loc = "?";
      const src = (e as any).__source as any;
      if (src) loc = `${src.fileName}:${src.lineNumber}`;
      else {
        // search files by slug
        const files = ["finance.ts", "everyday-life.ts", "health.ts", "transportation.ts", "utilities.ts", "technology.ts", "construction.ts"];
        outer: for (const f of files) {
          const path = `src/domains/calculator/registry/${f}`;
          try {
            const text = readFileSync(path, "utf8");
            const idx = text.indexOf(`slug: "${slug}"`);
            if (idx >= 0) {
              const line = text.slice(0, idx).split("\n").length;
              // count occurrences
              const occurrences = text.split(`slug: "${slug}"`).length - 1;
              loc = `${f}:${line} (${occurrences}x in file)`;
              break outer;
            }
          } catch {}
        }
      }
      console.log(`   [${e.category}/${e.subcategory}] isBuilt=${(e as any).isBuilt} @ ${loc}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
