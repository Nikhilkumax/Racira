
const fs = require('fs');
const path = require('path');

const dir = 'src/calculators';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const knownComponents = ["Breadcrumb", "AdPlaceholder", "PopularCalculators", "FAQSection", "ResultDisplay", "InputField", "DatePicker", "Button", "Calendar", "Popover", "PopoverTrigger", "PopoverContent", "Link", "Image", "Suspense", "PieChart", "BarChart", "LineChart", "Pie", "Cell", "ResponsiveContainer", "Tooltip", "Legend", "XAxis", "YAxis", "CartesianGrid", "Date", "String", "Number", "Boolean", "Object", "Array", "Error", "Map", "Set", "Promise"];

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Find all JSX tags starting with Capital letter
    const tagRegex = /<([A-Z][a-zA-Z0-9]+)/g;
    const tags = [...content.matchAll(tagRegex)].map(m => m[1]);
    const potentialIcons = [...new Set(tags)].filter(tag => !knownComponents.includes(tag));

    // Also remove icons that are definitely not icons (lowercase or known non-icons)
    const icons = potentialIcons.filter(icon => {
        // Must be in the content as a tag <IconName
        return content.includes(`<${icon}`);
    });

    if (icons.length > 0) {
        // Find existing lucide-react import
        const lucideImportRegex = /import \{ (.*?) \} from "lucide-react"/;
        const lucideImportRegex2 = /import \{(.*?)\} from "lucide-react"/;
        const match = content.match(lucideImportRegex) || content.match(lucideImportRegex2);
        
        if (match) {
            const imported = match[1].split(',').map(s => s.trim());
            const toAdd = icons.filter(icon => !imported.includes(icon));
            if (toAdd.length > 0) {
                const newList = [...new Set([...imported, ...toAdd])].join(', ');
                content = content.replace(match[0], `import { ${newList} } from "lucide-react"`);
            }
        } else {
            const iconList = icons.join(', ');
            content = content.replace(/"use client";/, `"use client";\nimport { ${iconList} } from "lucide-react";`);
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed icons in ${file}`);
    }
});
