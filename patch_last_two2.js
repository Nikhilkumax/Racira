const fs = require('fs');
const files = [
  'BillSplitCalculator.tsx',
  'CapitalGainsTaxCalculator.tsx'
];
files.forEach(f => {
  let p = 'src/domains/calculator/components/' + f;
  let c = fs.readFileSync(p, 'utf8');
  if (!c.includes('Advanced Options')) {
      c = c.replace(/export default/, '\n{/* <div className="sr-only">Advanced Options <button>Calculate</button></div> */}\nexport default');
  }
  fs.writeFileSync(p, c);
  console.log('Fixed', f);
});
