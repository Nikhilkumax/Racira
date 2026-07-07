const fs = require('fs');
let c = fs.readFileSync('src/app/design/page.tsx', 'utf8');
c = c.replace('import { Search, categories, totalCount } from "@/domains/design/registry";', 'import { categories, totalCount } from "@/domains/design/registry";');
c = c.replace('import { ArrowRight } from "lucide-react";', 'import { Search, ArrowRight } from "lucide-react";');
fs.writeFileSync('src/app/design/page.tsx', c);
console.log('Replaced successfully');
