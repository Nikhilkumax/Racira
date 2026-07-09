const fs = require('fs');
const cp = require('child_process');
const files = cp.execSync('find src/app src/domains -type f -name "*.tsx" -o -name "*.ts"', {encoding: 'utf8'}).split('\n').filter(Boolean);

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
      // If the first line is NOT use client (ignoring whitespace/BOM/comments is hard, let's just move it to index 0)
      if (!lines[0].includes('use client')) {
          const uc = lines.splice(ucIdx, 1)[0];
          
          // Special case: if line 0 has BOM, we should insert it after the BOM. But let's just unshift it and if there's BOM it might shift, but for standard files it's fine.
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
