import { CATEGORY_SUMMARY } from "../../src/app/calculator/summaryData";
import { onlyLive } from "../../src/lib/tools/liveToolFilters";
import { calculatorRegistry } from "../../src/domains/calculator/registry";
import { toSlug } from "../../src/lib/utils/slug";

async function main() {
  const live = onlyLive(calculatorRegistry) as any[];

  // 1. totals
  const liveTotal = live.length;
  const catSum = CATEGORY_SUMMARY.reduce((a: number, c: any) => a + (c.total || 0), 0);
  const subSum = CATEGORY_SUMMARY.reduce(
    (a: number, c: any) => a + (c.subcategories || []).reduce((x: number, s: any) => x + (s.count || 0), 0),
    0
  );
  console.log(`live entries: ${liveTotal}`);
  console.log(`CATEGORY_SUMMARY category total sum: ${catSum}`);
  console.log(`CATEGORY_SUMMARY subcategory count sum: ${subSum}`);
  console.log(`match: ${liveTotal === catSum && catSum === subSum ? "YES" : "NO"}`);

  // 2. duplicate slugs
  const slugs = new Map<string, number>();
  for (const t of live) slugs.set(t.slug, (slugs.get(t.slug) || 0) + 1);
  const dups = [...slugs.entries()].filter(([, n]) => n > 1);
  console.log(`\nduplicate live slugs: ${dups.length}`);
  for (const [s, n] of dups) console.log(`   ${s} (${n})`);

  // 3. cross-category subcategory slug collisions
  const subSlugs = new Map<string, string[]>();
  for (const c of CATEGORY_SUMMARY as any[]) {
    for (const s of c.subcategories || []) {
      const key = toSlug(s.name);
      if (!subSlugs.has(key)) subSlugs.set(key, []);
      subSlugs.get(key)!.push(`${c.category}/${s.name}`);
    }
  }
  const collisions = [...subSlugs.entries()].filter(([, v]) => v.length > 1);
  console.log(`\nsubcategory slug collisions: ${collisions.length}`);
  for (const [k, v] of collisions) console.log(`   ${k} -> ${v.join(" | ")}`);

  // 4. live tools with no matching category/subcategory in the summary
  const summaryPairs = new Set<string>();
  for (const c of CATEGORY_SUMMARY as any[]) {
    for (const s of c.subcategories || []) summaryPairs.add(`${c.category}\u0000${s.name}`);
  }
  const orphans = live.filter((t) => !summaryPairs.has(`${t.category}\u0000${String(t.subcategory || "General")}`));
  console.log(`\nlive tools not covered by any summary subcategory: ${orphans.length}`);
  for (const o of orphans.slice(0, 10)) console.log(`   ${o.slug} [${o.category}/${o.subcategory}]`);

  // 5. per-category breakdown
  console.log("\nper-category:");
  for (const c of CATEGORY_SUMMARY as any[]) {
    console.log(`   ${c.category.padEnd(14)} total=${c.total} subcategories=${c.subcategories.length}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
