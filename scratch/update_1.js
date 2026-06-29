const fs = require('fs');
const path = require('path');

const financePath = path.join(__dirname, '../src/data/calculators/finance.ts');
if (fs.existsSync(financePath)) {
  let finContent = fs.readFileSync(financePath, 'utf8');
  finContent = finContent.replace(/(slug:\s*['"]loan-payoff-calculator['"],\s*name:[^}]+?isBuilt:\s*)false/g, '$1true');
  fs.writeFileSync(financePath, finContent);
}

const appPath = path.join(__dirname, '../src/calculators/_approved.json');
if (fs.existsSync(appPath)) {
  const appData = JSON.parse(fs.readFileSync(appPath, 'utf8'));
  if (!appData.approved.includes('LoanPayoffCalculator')) {
    appData.approved.push('LoanPayoffCalculator');
    fs.writeFileSync(appPath, JSON.stringify(appData, null, 2));
  }
}
