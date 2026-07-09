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
  if (c.includes('t.description') || c.includes('t.desc') || c.includes('t.category') || c.includes('t.slug') || c.includes('t.built') || c.includes('t.name')) {
    if (c.includes('t as any')) {
      // it already has some fix, but let's just make it robust for all properties accessed inside the mapped registry
    }
    // We can replace `t.name` -> `(t as any).name`
    c = c.replaceAll('t.name', '(t as any).name');
    c = c.replaceAll('t.description', '(t as any).description');
    c = c.replaceAll('t.desc', '(t as any).desc');
    c = c.replaceAll('t.category', '(t as any).category');
    c = c.replaceAll('t.slug', '(t as any).slug');
    c = c.replaceAll('t.built', '(t as any).built');
    
    // Some pages might now have (t as any).name and then complain about something else.
    fs.writeFileSync(f, c);
    console.log('Fixed', f);
  }
}
