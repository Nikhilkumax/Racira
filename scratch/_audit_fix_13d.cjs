/**
 * Close the template grid div added earlier. The container's final "</div>\n  );"
 * needs one more </div> inserted before it (closing the grid).
 */
const fs = require('fs');

const FILES = [
  'ClosingCostCalculator', 'InventoryTurnoverCalculator', 'PpfCalculator',
  'PriceToBookRatioCalculator', 'RentVsBuyCalculator', 'SukanyaSamriddhiCalculator',
  'SupplyAndDemandEquilibriumPriceCalculator', 'TreasuryBillCalculator',
  'UnrealizedGainlossCalculator', 'AnnualPercentageYieldLoanCalculator',
];

for (const comp of FILES) {
  const f = `src/domains/calculator/components/${comp}.tsx`;
  let src = fs.readFileSync(f, 'utf8');
  // last "  );\n}" of the default export's return
  const idx = src.lastIndexOf('  );\n}');
  if (idx === -1) { console.log(comp + ': tail pattern not found'); continue; }
  const head = src.slice(0, idx);
  const tail = src.slice(idx);
  // find the last </div> before '  );' and insert another one after it
  const lastDiv = head.lastIndexOf('</div>');
  if (lastDiv === -1) { console.log(comp + ': no closing div found'); continue; }
  const fixed = head.slice(0, lastDiv) + '</div>' + head.slice(lastDiv + 6) + tail.replace('  );', '  );');
  fs.writeFileSync(f, fixed);
  console.log(comp + ': grid closing tag inserted');
}
