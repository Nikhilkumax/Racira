const fs = require('fs');
const path = require('path');

const registries = [
  path.join(__dirname, '../src/data/calculators/health.ts'),
  path.join(__dirname, '../src/data/calculators/sports.ts')
];

const slugsToUpdate = [
  "weight-gain-during-pregnancy-target-calculator",
  "baseball-on-base-percentage-calculator",
  "tennis-first-serve-percentage-calculator",
  "baseball-slugging-percentage-calculator",
  "baseball-fielding-percentage-calculator"
];

registries.forEach(registryPath => {
  if (fs.existsSync(registryPath)) {
    let content = fs.readFileSync(registryPath, 'utf8');
    let updated = false;
    slugsToUpdate.forEach(slug => {
      const regex = new RegExp(`({ slug: "${slug}",[\\s\\S]*?)isBuilt: false`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, '$1isBuilt: true');
        updated = true;
      }
    });
    if (updated) {
      fs.writeFileSync(registryPath, content, 'utf8');
      console.log(`Updated registry: ${path.basename(registryPath)}`);
    }
  }
});

console.log("Done bulk update part 21!");
