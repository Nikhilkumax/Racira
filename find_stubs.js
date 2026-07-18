const fs = require('fs');
const path = require('path');

const calcDir = path.join(__dirname, 'src/domains/calculator/components');
// Note: User said 'src/calculators/', but from additional metadata, the path is likely 'src/domains/calculator/components' or 'src/calculators' - wait, the metadata says `c:\Racira\racira-nextjs\src\domains\calculator\components\LandLoanPaymentCalculator.tsx`. Let me use that path.
const files = fs.readdirSync(calcDir).filter(f => f.endsWith('.tsx'));

const stubs = [];
for (const file of files) {
  const content = fs.readFileSync(path.join(calcDir, file), 'utf8');
  if (
    content.includes('Coming Soon') ||
    content.includes('coming-soon') ||
    content.includes('This calculator is planned') ||
    content.includes('Back to Calculators') ||
    content.includes('planned for a future')
  ) {
    stubs.push(file.replace('.tsx', ''));
  }
}

console.log(`Found ${stubs.length} Coming Soon stubs:`);
stubs.forEach(s => console.log('  •', s));
fs.writeFileSync('coming_soon_stubs.txt', stubs.join('\n'));
