/**
 * Complete the two-column template conversion for the 8 calculators that use
 * shadcn <Card> for their input panel (PpfCalculator-style structure):
 *   racira-page-container > [460px grid] > Breadcrumb > h1 div > Card > results...
 * → restructure to:
 *   racira-page-container > [460px grid] >
 *     LEFT:  <div className="card-calculator ..."><Card-less content></div>  (inputs)
 *     RIGHT: everything after the input Card
 * Because these files' internals differ, we do a precise, per-file restructure
 * using the shared shape: Breadcrumb block, h1 block, then input <Card ...>...</Card>.
 */
const fs = require('fs');

const FILES = [
  'PpfCalculator', 'InventoryTurnoverCalculator', 'RentVsBuyCalculator',
  'SukanyaSamriddhiCalculator', 'TreasuryBillCalculator', 'PriceToBookRatioCalculator',
  'SupplyAndDemandEquilibriumPriceCalculator', 'UnrealizedGainlossCalculator',
];

for (const comp of FILES) {
  const f = `src/domains/calculator/components/${comp}.tsx`;
  let src = fs.readFileSync(f, 'utf8');
  const before = src;

  // Match: Breadcrumb block ... h1 div block ... input Card block
  const bcRe = /(<Breadcrumb[\s\S]*?\/>)\s*\n\s*(<div className="mb-6">\s*<h1[\s\S]*?<\/h1>\s*<\/div>)\s*\n\s*(<Card[^>]*>[\s\S]*?<\/Card>)/;
  const m = src.match(bcRe);
  if (!m) {
    console.log(`${comp}: STRUCTURE NOT MATCHED — manual fix needed`);
    continue;
  }
  const [, breadcrumb, h1div, card] = m;
  // Derive the card title/description to keep inside the template panel
  const titleMatch = card.match(/<CardTitle>([^<]*)<\/CardTitle>/);
  const descMatch = card.match(/<CardDescription>([^<]*)<\/CardDescription>/);
  const title = titleMatch ? titleMatch[1] : '';
  const desc = descMatch ? `<p className="text-sm text-muted-foreground mb-4">${descMatch[1]}</p>` : '';
  // Inner content of CardContent
  const contentMatch = card.match(/<CardContent>([\s\S]*)<\/CardContent>/);
  const content = contentMatch ? contentMatch[1] : '';

  const replacement =
    breadcrumb + '\n\n' +
    `        <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">\n` +
    (title ? `          <h2 className="text-lg font-bold text-foreground">${title}</h2>\n` : '') +
    (desc ? `          ${desc}\n` : '') +
    `          <div className="contents">\n` + content + `\n          </div>\n` +
    `        </div>`;

  src = src.replace(bcRe, replacement);
  fs.writeFileSync(f, src);
  console.log(`${comp}: restructured to two-column template`);
}
