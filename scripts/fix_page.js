const fs = require('fs');
let c = fs.readFileSync('src/app/calculator/[slug]/page.tsx', 'utf8');
c = c.replace('import ComingSoonPage from "@/components/ComingSoonPage";', 'import ComingSoonCalculator from "@/components/calculators/ComingSoonCalculator";');
c = c.replaceAll('<ComingSoonPage', '<ComingSoonCalculator');
fs.writeFileSync('src/app/calculator/[slug]/page.tsx', c);
console.log('Replaced ComingSoonPage with ComingSoonCalculator');
