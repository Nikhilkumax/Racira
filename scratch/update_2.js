const fs = require('fs');
const path = require('path');

const everydayPath = path.join(__dirname, '../src/data/calculators/everyday-life.ts');
if (fs.existsSync(everydayPath)) {
  let content = fs.readFileSync(everydayPath, 'utf8');
  content = content.replace(/(slug:\s*['"]moving-cost-estimator['"],\s*name:[^}]+?isBuilt:\s*)false/g, '$1true');
  fs.writeFileSync(everydayPath, content);
}

const appPath = path.join(__dirname, '../src/calculators/_approved.json');
if (fs.existsSync(appPath)) {
  const appData = JSON.parse(fs.readFileSync(appPath, 'utf8'));
  if (!appData.approved.includes('MovingCostEstimator')) {
    appData.approved.push('MovingCostEstimator');
    fs.writeFileSync(appPath, JSON.stringify(appData, null, 2));
  }
}
