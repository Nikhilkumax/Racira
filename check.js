const fs = require('fs');
const path = require('path');
const cats = ['education', 'image', 'seo', 'writing'];
const appDir = path.join(__dirname, 'src', 'app');
for (let c of cats) {
  let content = fs.readFileSync(path.join(appDir, c, 'page.tsx'), 'utf8');
  let match = content.match(/<header[^>]*>.*?<\/header>/is);
  if (match) {
    console.log(`\n\n--- ${c} ---`);
    console.log(match[0]);
  }
}
