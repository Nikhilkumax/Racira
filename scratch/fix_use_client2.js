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
  if (c.includes('"use client"') || c.includes("'use client'")) {
    const lines = c.split('\n');
    let ucIdx = -1;
    for(let i=0; i<lines.length; i++) {
      if (lines[i].includes('use client')) {
        ucIdx = i;
        break;
      }
    }
    if (ucIdx > 0) {
      if (!lines[0].includes('use client')) {
          const uc = lines.splice(ucIdx, 1)[0];
          if (lines[0].charCodeAt(0) === 0xFEFF) {
             lines[0] = lines[0].substring(1);
             lines.unshift('\uFEFF' + uc);
          } else {
             lines.unshift(uc);
          }
          fs.writeFileSync(f, lines.join('\n'));
          console.log('Fixed', f);
      }
    }
  }
}
