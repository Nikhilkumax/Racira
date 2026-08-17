import { onlyLive } from "../../src/lib/tools/liveToolFilters";
import { calculatorRegistry } from "../../src/domains/calculator/registry";

async function main() {
  const live = onlyLive(calculatorRegistry) as any[];
  const byCat = new Map<string, Map<string, number>>();
  for (const t of live) {
    const cat = String(t.category || "(none)");
    const sub = String(t.subcategory || "General");
    if (!byCat.has(cat)) byCat.set(cat, new Map());
    const m = byCat.get(cat)!;
    m.set(sub, (m.get(sub) || 0) + 1);
  }
  const catOrder = [...byCat.keys()].sort((a, b) => a.localeCompare(b));
  let totalSubs = 0;
  let totalTools = 0;
  for (const cat of catOrder) {
    const m = byCat.get(cat)!;
    const catTotal = [...m.values()].reduce((a, b) => a + b, 0);
    totalTools += catTotal;
    console.log(`\n${cat} (${catTotal}):`);
    for (const [sub, n] of [...m.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`   ${sub} (${n})`);
      totalSubs++;
    }
  }
  console.log(`\nTOTAL live tools: ${totalTools} | distinct (cat, sub) pairs: ${totalSubs}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
