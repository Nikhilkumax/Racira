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
  let changed = false;
  
  // Find things like "resul(t as any).name" or "documen(t as any).desc"
  const regex = /([a-zA-Z])\(t as any\)\./g;
  if (regex.test(c)) {
    c = c.replace(regex, '$1t.');
    changed = true;
  }
  
  // also check if I messed up things like "por(t as any).name" (from port)
  
  if (changed) {
    fs.writeFileSync(f, c);
    console.log('Fixed boundary issue in', f);
  }
}
