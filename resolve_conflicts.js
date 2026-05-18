
const fs = require('fs');
const path = require('path');

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

const invalidIcons = ["Date", "String", "Number", "Boolean", "Object", "Array", "Error", "Map", "Set", "Promise", "HTMLDivElement", "MouseEvent", "ChangeEvent", "FormEvent", "Memory", "CanadianResults", "CurrencyCode", "AmortRow", "Shape", "Pace", "Mode", "Unit", "Category", "Species", "Raw", "Scaled", "Params", "Props", "State", "Option", "Item", "Type", "Tier", "Card", "Result"];

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

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

    // Aggressive cleanup
    content = content.replace(/import \{ (.*?) \} from "lucide-react"/, (match, p1) => {
        const parts = p1.split(',').map(s => s.trim()).filter(s => {
            const low = s.toLowerCase();
            if (invalidIcons.includes(s)) return false;
            if (s.endsWith('Result')) return false;
            if (s.endsWith('Results')) return false;
            if (s.endsWith('Props')) return false;
            if (s.endsWith('Row')) return false;
            if (s.endsWith('Data')) return false;
            if (s.endsWith('Tier')) return false;
            if (s.endsWith('Option')) return false;
            if (s.endsWith('Type')) return false;
            if (s.endsWith('Item')) return false;
            return true;
        });
        return `import { ${parts.join(', ')} } from "lucide-react"`;
    });
    content = content.replace(/import \{(.*?)\} from "lucide-react"/, (match, p1) => {
        const parts = p1.split(',').map(s => s.trim()).filter(s => {
            if (invalidIcons.includes(s)) return false;
            if (s.endsWith('Result')) return false;
            if (s.endsWith('Results')) return false;
            if (s.endsWith('Props')) return false;
            if (s.endsWith('Row')) return false;
            if (s.endsWith('Data')) return false;
            if (s.endsWith('Tier')) return false;
            if (s.endsWith('Option')) return false;
            if (s.endsWith('Type')) return false;
            if (s.endsWith('Item')) return false;
            return true;
        });
        return `import { ${parts.join(', ')} } from "lucide-react"`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned up conflicts in ${file}`);
    }
});
