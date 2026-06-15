const fs = require('fs');
let c = fs.readFileSync('src/app/tools/_pdf/[slug]/edit/EditClient.tsx', 'utf8');
c = c.replace(/includes\(slug/g, 'includes((slug as string)');
c = c.replace(/includes\(\(slug as string\) as string\)/g, 'includes((slug as string)');
c = c.replace(/includes\(\(slug as string\) \|\| \"\"\)/g, 'includes((slug as string) || "")');
fs.writeFileSync('src/app/tools/_pdf/[slug]/edit/EditClient.tsx', c);
console.log('Fixed EditClient slug typing 2');
