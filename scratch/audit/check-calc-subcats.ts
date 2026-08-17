import { CATEGORY_SUMMARY } from "../../src/app/calculator/summaryData";
import { onlyLive } from "../../src/lib/tools/liveToolFilters";
import { calculatorRegistry } from "../../src/domains/calculator/registry";

async function main() {
  const live = onlyLive(calculatorRegistry) as any[];
  let totalUnassigned = 0;
  for (const c of CATEGORY_SUMMARY as any[]) {
    const catTotal = live.filter((t) => t.category === c.category).length;
    const subSum = (c.subcategories || []).reduce((a: number, s: any) => a + (s.count || 0), 0);
    const unassigned = catTotal - subSum;
    if (unassigned !== 0) {
      totalUnassigned += unassigned;
      console.log(`${c.category}: category=${catTotal} subcategorySum=${subSum} unassigned=${unassigned}`);
      const orphans = live.filter(
        (t) =>
          t.category === c.category &&
          !(c.subcategories || []).some((s: any) => s.name === t.subcategory)
      );
      for (const o of orphans.slice(0, 10)) {
        console.log(`   orphan: ${o.slug} | subcategory="${o.subcategory}"`);
      }
    } else {
      console.log(`${c.category}: category=${catTotal} subcategorySum=${subSum} OK`);
    }
  }
  console.log(`\ntotal unassigned across categories: ${totalUnassigned}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
