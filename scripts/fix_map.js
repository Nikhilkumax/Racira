const fs = require('fs');
let code = fs.readFileSync('src/domains/seo/registry.ts', 'utf8');

code = code.replace(/import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/s, (match, p1) => {
    let imports = p1.split(',').map(i => i.trim());
    if (imports.includes('Map')) {
        imports = imports.filter(i => i !== 'Map');
        imports.push('Map as MapIcon');
    }
    return `import { ${imports.join(', ')} } from "lucide-react"`;
});

code = code.replace(/icon:\s*Map\b/g, 'icon: MapIcon');

fs.writeFileSync('src/domains/seo/registry.ts', code);
console.log('Fixed MapIcon in SEO');
