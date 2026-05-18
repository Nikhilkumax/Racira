
const fs = require('fs');
const path = require('path');

const dir = 'src/calculators';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const invalidIcons = ["Date", "String", "Number", "Boolean", "Object", "Array", "Error", "Map", "Set", "Promise"];

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    invalidIcons.forEach(invalid => {
        const regex = new RegExp(`import \\{ (.*?) \\} from "lucide-react"`);
        const regex2 = new RegExp(`import \\{(.*?)\\} from "lucide-react"`);
        
        content = content.replace(regex, (match, p1) => {
            const parts = p1.split(',').map(s => s.trim()).filter(s => s !== invalid);
            return `import { ${parts.join(', ')} } from "lucide-react"`;
        });
        content = content.replace(regex2, (match, p1) => {
            const parts = p1.split(',').map(s => s.trim()).filter(s => s !== invalid);
            return `import { ${parts.join(', ')} } from "lucide-react"`;
        });
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned up invalid icons in ${file}`);
    }
});
