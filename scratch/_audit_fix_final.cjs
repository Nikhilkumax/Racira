/**
 * Final per-file template fixes (13 calculators).
 * Group A (4): remove own nav+h1, widen grid to 460px template, tag panel.
 * Group S (7 shadcn): PPF-style restructure (Breadcrumb kept, h1 dropped,
 *   input Card -> card-calculator left column, everything after -> right column).
 * Group C (1): ClosingCost hero -> template container+grid (+1 close).
 * Then structural verification per file.
 */
const fs = require('fs');

const A = ['AdjustableRateMortgageArmPaymentCalculator', 'AmortizationPeriodVsLoanTermComparison', 'AssumableMortgageBenefitCalculator', 'AnnualPercentageYieldLoanCalculator'];
for (const comp of A) {
  const f = `src/domains/calculator/components/${comp}.tsx`;
  let src = fs.readFileSync(f, 'utf8');
  const o = src;
  src = src.replace(/\{\/\* BREADCRUMB \*\/\}\s*<nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">[\s\S]*?<\/nav>\s*\{\/* H1[^\n]*\*\/}\s*<h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">\s*[^<]*\s*<\/h1>\s*/, '');
  src = src.replace('<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">', '<div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">');
  src = src.replace('<div className="bg-card border border-border rounded-lg p-4">', '<div className="card-calculator bg-card border border-border rounded-lg p-4">');
  console.log(comp, src !== o && /lg:grid-cols-\[460px_1fr\]/.test(src) ? 'A-fix OK' : 'CHECK MANUALLY');
  fs.writeFileSync(f, src);
}

const S = ['InventoryTurnoverCalculator', 'RentVsBuyCalculator', 'SukanyaSamriddhiCalculator', 'TreasuryBillCalculator', 'PriceToBookRatioCalculator', 'SupplyAndDemandEquilibriumPriceCalculator', 'UnrealizedGainlossCalculator'];
const bcRe = /(<Breadcrumb[\s\S]*?\/>)\s*\n\s*(<div className="mb-6">\s*<h1[\s\S]*?<\/h1>\s*<\/div>)\s*\n\s*(<Card[^>]*>[\s\S]*?<\/Card>)/;
for (const comp of S) {
  const f = `src/domains/calculator/components/${comp}.tsx`;
  let src = fs.readFileSync(f, 'utf8');
  const m = src.match(bcRe);
  if (!m) { console.log(comp, 'S-fix: STRUCTURE NOT MATCHED'); continue; }
  const [, breadcrumb, , card] = m;
  const titleMatch = card.match(/<CardTitle[^>]*>([^<]*)<\/CardTitle>/);
  const descMatch = card.match(/<CardDescription>([^<]*)<\/CardDescription>/);
  const contentMatch = card.match(/<CardContent>([\s\S]*)<\/CardContent>/);
  const title = titleMatch ? titleMatch[1] : '';
  const desc = descMatch ? `<p className="text-sm text-muted-foreground">${descMatch[1]}</p>` : '';
  const content = contentMatch ? contentMatch[1] : '';
  const replacement =
    breadcrumb + '\n\n' +
    `        {/* LEFT: inputs (Mortgage Calculator template) */}\n` +
    `        <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">\n` +
    (title ? `          <h2 className="text-lg font-bold text-foreground">${title}</h2>\n` : '') +
    (desc ? `          ${desc}\n` : '') +
    `          <div className="contents">\n` + content + `\n          </div>\n` +
    `        </div>\n\n` +
    `        {/* RIGHT: results + content */}\n` +
    `        <div className="flex flex-col gap-4">`;
  src = src.replace(bcRe, replacement);
  // close RIGHT column + grid before the container's final close
  const tailIdx = src.lastIndexOf('    </div>\r\n  );');
  const tailIdx2 = src.lastIndexOf('    </div>\n  );');
  const idx = Math.max(tailIdx, tailIdx2);
  if (idx === -1) { console.log(comp, 'S-fix: tail not found'); continue; }
  src = src.slice(0, idx) + '        </div>\n      </div>\n' + src.slice(idx);
  fs.writeFileSync(f, src);
  console.log(comp, 'S-fix applied');
}

// Group C: ClosingCostCalculator
{
  const f = 'src/domains/calculator/components/ClosingCostCalculator.tsx';
  let src = fs.readFileSync(f, 'utf8');
  const o = src;
  src = src.replace(
    /<div className="max-w-7xl px-4 py-8 sm:px-6 lg:px-8">\s*\{\/\* Header \*\/\}\s*<div className="mb-12 text-center">[\s\S]*?<\/h1>\s*<\/div>\s*/,
    '<div className="racira-page-container py-4">\n      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">\n'
  );
  if (src !== o) {
    // +1 open div (grid): close it before the container close
    const idx = Math.max(src.lastIndexOf('    </div>\r\n  );'), src.lastIndexOf('    </div>\n  );'));
    src = src.slice(0, idx) + '      </div>\n' + src.slice(idx);
    src = src.replace('import { Calculator } from "lucide-react";\r\n', '').replace('import { Calculator } from "lucide-react";\n', '');
    fs.writeFileSync(f, src);
    console.log('ClosingCostCalculator: C-fix applied');
  } else {
    console.log('ClosingCostCalculator: C-fix NOT MATCHED');
  }
}
