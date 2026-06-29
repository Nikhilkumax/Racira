const fs = require('fs');
const path = require('path');

const financePath = path.join(__dirname, '../src/data/calculators/finance.ts');
if (fs.existsSync(financePath)) {
  let content = fs.readFileSync(financePath, 'utf8');
  content = content.replace(/(slug:\s*['"]car-insurance-calculator['"],\s*name:[^}]+?isBuilt:\s*)false/g, '$1true');
  fs.writeFileSync(financePath, content);
} else {
  const everydayPath = path.join(__dirname, '../src/data/calculators/everyday-life.ts');
  if (fs.existsSync(everydayPath)) {
    let content = fs.readFileSync(everydayPath, 'utf8');
    content = content.replace(/(slug:\s*['"]car-insurance-calculator['"],\s*name:[^}]+?isBuilt:\s*)false/g, '$1true');
    fs.writeFileSync(everydayPath, content);
  }
}

const appPath = path.join(__dirname, '../src/calculators/_approved.json');
if (fs.existsSync(appPath)) {
  const appData = JSON.parse(fs.readFileSync(appPath, 'utf8'));
  if (!appData.approved.includes('CarInsuranceCalculator')) {
    appData.approved.push('CarInsuranceCalculator');
    fs.writeFileSync(appPath, JSON.stringify(appData, null, 2));
  }
}
