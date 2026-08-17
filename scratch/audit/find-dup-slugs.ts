import { onlyLive } from "../../src/lib/tools/liveToolFilters";
import { calculatorRegistry } from "../../src/domains/calculator/registry";

async function main() {
  const live = onlyLive(calculatorRegistry) as any[];
  const seen = new Map<string, any[]>();
  for (const t of live) {
    if (!seen.has(t.slug)) seen.set(t.slug, []);
    seen.get(t.slug)!.push(t);
  }
  let dupSlugs = 0;
  let dupEntries = 0;
  for (const [slug, entries] of seen) {
    if (entries.length > 1) {
      dupSlugs++;
      dupEntries += entries.length - 1;
      console.log(`\nDUP "${slug}" (${entries.length} entries):`);
      for (const e of entries) {
        console.log(`   [${e.category}/${e.subcategory}] name=${(e as any).name || "?"} isBuilt=${(e as any).isBuilt}`);
      }
    }
  }
  console.log(`\nTOTAL live entries: ${live.length} | unique slugs: ${seen.size} | duplicate slugs: ${dupSlugs} | extra entries: ${dupEntries}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
