import { CATEGORY_SUMMARY } from "../../src/app/calculator/summaryData";
import { onlyLive } from "../../src/lib/tools/liveToolFilters";
import { calculatorRegistry } from "../../src/domains/calculator/registry";

async function main() {
  const live = onlyLive(calculatorRegistry);
  const liveTotal = live.length;
  const catSum = CATEGORY_SUMMARY.reduce((a: number, c: any) => a + (c.total || 0), 0);
  console.log("onlyLive total:", liveTotal);
  console.log("CATEGORY_SUMMARY category-total sum:", catSum);
  console.log("difference:", liveTotal - catSum);

  const summaryCats = new Set<string>(CATEGORY_SUMMARY.map((c: any) => c.category));
  console.log("\nCATEGORY_SUMMARY categories:", [...summaryCats].join(", "));

  const liveCats = new Map<string, number>();
  for (const t of live as any[]) {
    const cat = String(t.category || "(none)");
    liveCats.set(cat, (liveCats.get(cat) || 0) + 1);
  }
  console.log("\nlive category distribution:");
  for (const [cat, n] of liveCats) {
    const inSummary = summaryCats.has(cat);
    console.log(`  ${cat.padEnd(30)} n=${String(n).padStart(4)} ${inSummary ? "" : "<-- NOT in CATEGORY_SUMMARY"}`);
  }

  const uncounted = (live as any[]).filter((t) => !summaryCats.has(String(t.category || "(none)")));
  console.log("\nuncounted tools:", uncounted.length);
  for (const t of uncounted) {
    console.log(`  ${t.slug} | name=${(t as any).name || "?"} | category=${t.category}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
