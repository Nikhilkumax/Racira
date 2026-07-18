const fs = require('fs');
let log = fs.readFileSync('tsc_errors.log');
log = Buffer.from(log).toString('utf16le');
const files = new Set();
const lines = log.split('\n');
lines.forEach(line => {
  if (line.includes('src/domains/calculator/components/')) {
     const match = line.match(/src\/domains\/calculator\/components\/([a-zA-Z0-9_]+\.tsx)/);
     if (match) files.add(match[1]);
  }
});
console.log('Broken files:', files.size);
if (files.size > 0) {
  const fileArray = Array.from(files);
  files.forEach(f => {
    const p = 'src/domains/calculator/components/' + f;
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/<\/div>\s*<div>\s*<h2 className="text-2xl font-bold mb-3">/g, '<div>\n                <h2 className="text-2xl font-bold mb-3">');
    fs.writeFileSync(p, c);
  });
  console.log('Fixed broken files');
}
