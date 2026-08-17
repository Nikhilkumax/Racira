import { onlyLive } from "../../src/lib/tools/liveToolFilters";
import { calculatorRegistry } from "../../src/domains/calculator/registry";

async function main() {
  const live = onlyLive(calculatorRegistry) as any[];
  // group by subcategory name across categories
  const bySub = new Map<string, { cat: string; slug: string; name: string }[]>();
  for (const t of live) {
    const sub = String(t.subcategory || "General");
    if (!bySub.has(sub)) bySub.set(sub, []);
    bySub.get(sub)!.push({ cat: String(t.category), slug: t.slug, name: (t as any).name || "?" });
  }
  for (const [sub, entries] of bySub) {
    const cats = new Set(entries.map((e) => e.cat));
    if (cats.size > 1) {
      console.log(`\nCOLLISION: "${sub}" across ${[...cats].join(", ")} (${entries.length} tools)`);
      for (const e of entries) console.log(`   [${e.cat}] ${e.slug} — ${e.name}`);
    }
  }
  console.log("\ndone");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
