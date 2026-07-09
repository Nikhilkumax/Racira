const fs = require('fs');
const file = 'src/app/flowchart/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the mangled CategorySearch href
content = content.replace(/\\\/flowchart\/tools\/\\\\/g, '\/flowchart/tools/\\');

// Fix the mangled Link href
content = content.replace(/href=\{\\\/flowchart\/tool\/\\\\\}/g, 'href={\/flowchart/tool/\\}');

fs.writeFileSync(file, content, 'utf8');
