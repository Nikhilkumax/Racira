// Anatomy scan for Batch 3 target files — extracts everything the codemod needs.
const fs = require("fs");

const TOOLS = [
  // [ContentKey, ComponentFile]
  ["AdjustableRateMortgageArmPaymentCalculator", "AdjustableRateMortgageArmPaymentCalculator"],
  ["AmortizationPeriodVsLoanTermComparison", "AmortizationPeriodVsLoanTermComparison"],
  ["AnnualPercentageYieldLoanCalculator", "AnnualPercentageYieldLoanCalculator"],
  ["AssumableMortgageBenefitCalculator", "AssumableMortgageBenefitCalculator"],
  ["ClosingCostCalculator", "ClosingCostCalculator"],
  ["ConvexityCalculator", "ConvexityCalculator"],
  ["CustodialAccountGrowthCalculator", "CustodialAccountGrowthCalculator"],
  ["DebtToAssetRatioCalculator", "DebtToAssetRatioCalculator"],
  ["FixedChargeCoverageRatioCalculator", "FixedChargeCoverageRatioCalculator"],
  ["InventoryTurnoverCalculator", "InventoryTurnoverCalculator"],
  ["LandLoanPaymentCalculator", "LandLoanPaymentCalculator"],
  ["LiquidatedDamagesCalculator", "LiquidatedDamagesCalculator"],
  ["PpfCalculator", "PpfCalculator"],
  ["PriceToBookRatioCalculator", "PriceToBookRatioCalculator"],
  ["RentVsBuyCalculator", "RentVsBuyCalculator"],
  ["RetainedEarningsCalculator", "RetainedEarningsCalculator"],
  ["SukanyaSamriddhiCalculator", "SukanyaSamriddhiCalculator"],
  ["SupplyAndDemandEquilibriumPriceCalculator", "SupplyAndDemandEquilibriumPriceCalculator"],
  ["TotalFactorProductivityCalculator", "TotalFactorProductivityCalculator"],
  ["TreasuryBillCalculator", "TreasuryBillCalculator"],
  ["UnrealizedGainLossCalculator", "UnrealizedGainLossCalculator"],
];

const out = [];
for (const [key, file] of TOOLS) {
  const p = `src/domains/calculator/components/${file}.tsx`;
  const t = fs.readFileSync(p, "utf8");
  const lines = t.split("\n");
  const has = (s) => t.includes(s);
  const info = {
    key,
    file,
    lines: lines.length,
    crlf: t.includes("\r\n"),
    racira: has("racira-page-container"),
    breadcrumbComp: has("Breadcrumb") && has('from "@/components/Breadcrumb"'),
    breadcrumbNav: /<nav[^>]*aria-label="Breadcrumb"/.test(t),
    faqSection: has("FAQSection"),
    faqPageUrl: has("pageUrl="),
    adPlaceholder: has("AdPlaceholder"),
    popular: has("PopularCalculators"),
    proseFinance: has("prose-finance"),
    valErrors: has("valErrors"),
    shadcnInput: has('from "@/components/ui/input"'),
    showResults: has("showResults"),
    calculateBtn: /disabled=\{[^}]*invalid/.test(t) || /disabled=\{hasValidationErrors/.test(t),
    // state hook names
    useStateNames: [...t.matchAll(/const \[(\w+), set(\w+)\] = useState/g)].map(m => m[1]).slice(0, 12),
    // last import line number
    lastImportIdx: (() => {
      let last = -1;
      lines.forEach((l, i) => { if (/^import /.test(l)) last = i; });
      return last;
    })(),
    // tail markers
    tail: lines.slice(-8).map(l => l.trim().slice(0, 70)).filter(Boolean),
  };
  // find insertion anchors
  const closingStackIdx = lines.findIndex((l, i) => i > 0 && /^\s*<\/div>\s*$/.test(l) && lines.slice(i + 1).join("").includes("export default"));
  // locate the final "</div>" that closes the root and the closing ")\n}" — find "  );" near end
  let closeParenIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^\s*\);?\s*$/.test(lines[i]) && lines.slice(i, i + 4).join("\n").includes("}")) { closeParenIdx = i; break; }
  }
  info.closeParenIdx = closeParenIdx;
  // the root-close </div> right before `);` block — scan upward for first line that is exactly "</div>" (possibly with indent) after PopularCalculators
  let rootCloseIdx = -1;
  for (let i = closeParenIdx - 1; i > 0; i--) {
    if (/^\s*<\/div>\s*$/.test(lines[i])) { rootCloseIdx = i; break; }
  }
  info.rootCloseIdx = rootCloseIdx;
  // does PopularCalculators appear after rootCloseIdx? (i.e., inside the root, near tail)
  const popIdx = lines.findIndex(l => l.includes("<PopularCalculators"));
  info.popIdx = popIdx;
  info.popAfterRootClose = popIdx > rootCloseIdx;
  out.push(info);
}
fs.writeFileSync("scripts/batch3_anatomy.json", JSON.stringify(out, null, 2));
console.log("Wrote scripts/batch3_anatomy.json with", out.length, "files");
for (const o of out) {
  console.log(
    `${o.key}: lines=${o.lines} crlf=${o.crlf} racira=${o.racira} bComp=${o.breadcrumbComp} bNav=${o.breadcrumbNav} faq=${o.faqSection} ad=${o.adPlaceholder} pop=${o.popular} prose=${o.proseFinance} val=${o.valErrors} shadcn=${o.shadcnInput} showRes=${o.showResults} rootClose=${o.rootCloseIdx} popIdx=${o.popIdx}`
  );
}
