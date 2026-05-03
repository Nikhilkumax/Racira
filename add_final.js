const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');
const existingSlugs = new Set([...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]));

const names = [
  // 19 exact real calculators
  ["Lease vs Buy Calculator", "Finance", "Auto", "Car"],
  ["Home Affordability Calculator", "Finance", "Real Estate", "Home"],
  ["Rent Affordability Calculator", "Finance", "Real Estate", "Home"],
  ["Refinance Break-Even Calculator", "Finance", "Real Estate", "Home"],
  ["Tax Equivalent Yield Calculator", "Finance", "Investment", "TrendingUp"],
  ["Expected Return Calculator", "Finance", "Investment", "TrendingUp"],
  ["Rule of 70 Calculator", "Finance", "Investment", "TrendingUp"],
  ["Investment Property Calculator", "Finance", "Real Estate", "Building"],
  ["Property Tax Calculator", "Finance", "Real Estate", "Landmark"],
  ["Tip and Split Calculator", "Everyday Life", "Finance", "DollarSign"],
  ["BMI Percentile Calculator", "Health", "Body Metrics", "User"],
  ["Lean Mass Calculator", "Health", "Body Metrics", "User"],
  ["Running Calorie Calculator", "Sports", "Running", "Activity"],
  ["Walking Calorie Calculator", "Sports", "Walking", "Activity"],
  ["Cycling Power Calculator", "Sports", "Cycling", "Zap"],
  ["Pace Converter", "Sports", "Running", "Timer"],
  ["Miles Per Gallon Calculator", "Automobile", "Costs", "Fuel"],
  ["Engine Compression Calculator", "Automobile", "Performance", "Settings"],
  ["Tire Diameter Calculator", "Automobile", "Performance", "Circle"]
];

const toAdd = [];
names.forEach(([name, cat, sub, icon]) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!existingSlugs.has(slug)) {
    toAdd.push({
      slug, name, cat, sub, icon,
      desc: `A free ${name.toLowerCase()} to easily calculate your results.`,
    });
    existingSlugs.add(slug);
  }
});

let str = '\n\n  // ══════════════════════════════════════════════\n  // 🏁 FINAL BATCH\n  // ══════════════════════════════════════════════\n';
toAdd.forEach(e => {
  str += `  { slug: "${e.slug}", name: "${e.name}", description: "${e.desc}", category: "${e.cat}", subcategory: "${e.sub}", icon: Calculator, isBuilt: false },\n`;
});

const insertAt = content.lastIndexOf('];');
content = content.slice(0, insertAt) + str + '\n' + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');

const finalCount = [...fs.readFileSync(file, 'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].length;
console.log(`✅ Added ${toAdd.length} calculators.`);
console.log(`📊 Total registry count: ${finalCount}`);
