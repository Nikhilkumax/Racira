const fs = require('fs');
let c = fs.readFileSync('src/app/tools/_pdf/[slug]/edit/EditClient.tsx', 'utf8');
c = c.replace('IMAGE_TOOLS.includes(slug)', 'IMAGE_TOOLS.includes(slug as string)');
c = c.replace('EDITOR_TOOLS.includes(slug)', 'EDITOR_TOOLS.includes(slug as string)');
c = c.replace('FILE_TOOLS.includes(slug)', 'FILE_TOOLS.includes(slug as string)');
fs.writeFileSync('src/app/tools/_pdf/[slug]/edit/EditClient.tsx', c);
console.log('Fixed EditClient slug typing');
