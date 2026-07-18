const fs = require('fs');
let code = fs.readFileSync('src/domains/education/registry.ts', 'utf8');
code = code.replace(/import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/s, (match, p1) => { 
    let imports = p1.split(',').map(i => i.trim()); 
    imports.push('LucideIcon'); 
    return `import { ${imports.join(', ')} } from "lucide-react"`; 
}); 
fs.writeFileSync('src/domains/education/registry.ts', code); 
console.log('Fixed LucideIcon in Education');
