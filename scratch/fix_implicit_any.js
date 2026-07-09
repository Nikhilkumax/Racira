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
    
    // Fix cat =>
    const regexCat = /\bcat =>/g;
    if (regexCat.test(c)) {
      c = c.replace(regexCat, '(cat: any) =>');
      changed = true;
    }
    
    // Fix t =>
    const regexT = /\bt =>/g;
    if (regexT.test(c)) {
      c = c.replace(regexT, '(t: any) =>');
      changed = true;
    }
    
    // Fix section =>
    const regexSection = /\bsection =>/g;
    if (regexSection.test(c)) {
      c = c.replace(regexSection, '(section: any) =>');
      changed = true;
    }
    
    // Fix group =>
    const regexGroup = /\bgroup =>/g;
    if (regexGroup.test(c)) {
      c = c.replace(regexGroup, '(group: any) =>');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(f, c);
      console.log('Fixed implicit any in', f);
    }
  }
}
