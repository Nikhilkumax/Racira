const fs = require('fs');

const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');

const mapping = {
  'Financial & Loan':       'Finance',
  'Indian Finance':         'Finance',
  'Investment & Retirement': 'Finance',
  'Business':               'Finance',
  'Real Estate':            'Finance',     // Real estate calculators are financial in nature
  'Fitness & Health':       'Health',
  'Science & Engineering':  'Science',
  'Time & Date':            'Everyday Life',
  'Lifestyle':              'Everyday Life',
  'Tech':                   'Technology',
  // Kept as-is: Math, Construction, Automobile, Education, Conversion, Sports, Ecology
};

let changeCount = 0;

// Show preview before applying
Object.entries(mapping).forEach(([from, to]) => {
  const pattern = new RegExp(`category: "${from.replace(/&/g, '\\&')}"`, 'g');
  const matches = content.match(pattern);
  if (matches) {
    console.log(`  "${from}" → "${to}"  (${matches.length} entries)`);
    changeCount += matches.length;
  }
});

console.log(`\nTotal category field changes: ${changeCount}`);
