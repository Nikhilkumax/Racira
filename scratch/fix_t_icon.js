const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src/app').concat(walk('./src/domains'));

for(const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('icon: t.icon')) {
    c = c.replaceAll('icon: t.icon', 'icon: (t as any).icon');
    fs.writeFileSync(f, c);
    console.log('Fixed', f);
  }
}
