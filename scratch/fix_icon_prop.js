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

const files = walk('./src/app');

for(const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('<CategorySearch')) {
    let changed = false;
    
    // Removing the icon prop from the registry mapped array
    const regexIcon1 = /icon:\s*\(t as any\)\.icon,\s*/g;
    const regexIcon2 = /icon:\s*t\.icon,\s*/g;
    
    if (regexIcon1.test(c)) {
      c = c.replace(regexIcon1, '');
      changed = true;
    }
    if (regexIcon2.test(c)) {
      c = c.replace(regexIcon2, '');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(f, c);
      console.log('Removed icon prop in', f);
    }
  }
}
