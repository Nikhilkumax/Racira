const fs = require('fs');
const path = require('path');
const stubs = fs.readFileSync('stub_list.txt', 'utf8').split('\n').filter(Boolean);
const dir = 'src/domains/calculator/registry';
const files = fs.readdirSync(dir);
let liveCount = 0;
let soonCount = 0;
let unknownCount = 0;
for (const stub of stubs) {
  let slug = stub.replace('Calculator', '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  // some slugs end in -calculator, some don't. Let's just find the file that exports it.
  
  let foundStatus = null;
  for (const file of files) {
    if (!file.endsWith('.ts')) continue;
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    // Using a simpler string matching logic instead of complex regex to avoid edge cases
    
    // We can just parse the file or look for the exact component name, but the component name is not in the registry.
    // The slug is in the registry.
    // Let's just try to find the slug, it's either `slug` or `slug-calculator`.
    let match = content.match(new RegExp(`slug:\\s*['"](${slug}|${slug}-calculator)['"]([^}]*)status:\\s*['"](live|soon)['"]`, 's'));
    if (match) {
      foundStatus = match[3];
      break;
    }
  }
  if (foundStatus === 'live') liveCount++;
  else if (foundStatus === 'soon') soonCount++;
  else unknownCount++;
}
console.log('Stubs with status: live =', liveCount);
console.log('Stubs with status: soon =', soonCount);
console.log('Stubs with unknown status =', unknownCount);
