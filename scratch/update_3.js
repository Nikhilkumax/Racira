const fs = require('fs');
const path = require('path');

const constructionPath = path.join(__dirname, '../src/data/calculators/construction.ts');
if (fs.existsSync(constructionPath)) {
  let content = fs.readFileSync(constructionPath, 'utf8');
  content = content.replace(/(slug:\s*['"]construction-loan-draw-calculator['"],\s*name:[^}]+?isBuilt:\s*)false/g, '$1true');
  fs.writeFileSync(constructionPath, content);
} else {
  // Try real estate if it's there
  const rePath = path.join(__dirname, '../src/data/calculators/finance.ts');
  if (fs.existsSync(rePath)) {
    let content = fs.readFileSync(rePath, 'utf8');
    content = content.replace(/(slug:\s*['"]construction-loan-draw-calculator['"],\s*name:[^}]+?isBuilt:\s*)false/g, '$1true');
    fs.writeFileSync(rePath, content);
  }
}

const appPath = path.join(__dirname, '../src/calculators/_approved.json');
if (fs.existsSync(appPath)) {
  const appData = JSON.parse(fs.readFileSync(appPath, 'utf8'));
  if (!appData.approved.includes('ConstructionLoanDrawCalculator')) {
    appData.approved.push('ConstructionLoanDrawCalculator');
    fs.writeFileSync(appPath, JSON.stringify(appData, null, 2));
  }
}
