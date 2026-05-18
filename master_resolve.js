
const fs = require('fs');
const path = require('path');

// 1. Get real icons from lucide-react
const iconsFile = 'node_modules/lucide-react/dist/esm/icons/index.js';
let validIcons = new Set();
if (fs.existsSync(iconsFile)) {
    const iconsContent = fs.readFileSync(iconsFile, 'utf8');
    const matches = iconsContent.matchAll(/export \{ default as ([a-zA-Z0-9]+) \}/g);
    for (const match of matches) {
        validIcons.add(match[1]);
    }
    console.log(`Found ${validIcons.size} valid icons in lucide-react`);
} else {
    console.log("Could not find lucide-react icons index. Using fallback.");
}

const dir = 'src/calculators';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const componentsToClean = [
    { component: '@/components/calculator/PieChart', icon: 'PieChart' },
    { component: '@/components/ui/calendar', icon: 'Calendar' },
    { component: '@/components/ui/button', icon: 'Button' },
    { component: '@/components/ui/select', icons: ['Select', 'SelectTrigger', 'SelectValue', 'SelectContent', 'SelectItem'] },
    { component: '@/components/ui/tabs', icons: ['Tabs', 'TabsList', 'TabsTrigger', 'TabsContent'] },
    { component: '@/components/ui/card', icons: ['Card', 'CardHeader', 'CardTitle', 'CardContent'] },
    { component: '@/components/calculator/AmortizationTable', icon: 'AmortizationTable' }
];

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Remove specific component conflicts
    componentsToClean.forEach(conflict => {
        if (content.includes(conflict.component)) {
            const iconsToRemove = conflict.icons || [conflict.icon];
            content = content.replace(/import \{ (.*?) \} from "lucide-react"/, (match, p1) => {
                const parts = p1.split(',').map(s => s.trim()).filter(s => !iconsToRemove.includes(s));
                return `import { ${parts.join(', ')} } from "lucide-react"`;
            });
            content = content.replace(/import \{(.*?)\} from "lucide-react"/, (match, p1) => {
                const parts = p1.split(',').map(s => s.trim()).filter(s => !iconsToRemove.includes(s));
                return `import { ${parts.join(', ')} } from "lucide-react"`;
            });
        }
    });

    // MASTER CLEANUP: Only keep icons that actually exist in lucide-react
    if (validIcons.size > 0) {
        content = content.replace(/import \{ (.*?) \} from "lucide-react"/, (match, p1) => {
            const parts = p1.split(',').map(s => s.trim()).filter(s => validIcons.has(s));
            return `import { ${parts.join(', ')} } from "lucide-react"`;
        });
        content = content.replace(/import \{(.*?)\} from "lucide-react"/, (match, p1) => {
            const parts = p1.split(',').map(s => s.trim()).filter(s => validIcons.has(s));
            return `import { ${parts.join(', ')} } from "lucide-react"`;
        });
    }

    // Clean up empty imports or double commas
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/\{ ,/g, '{ ');
    content = content.replace(/, \}/g, ' }');
    content = content.replace(/import \{  \} from "lucide-react";\n/g, '');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Master-cleaned icons in ${file}`);
    }
});
